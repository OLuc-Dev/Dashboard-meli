import json
import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required

from auth import auth_bp
from mercadolivre_api import meli_api
from models import User, bcrypt, db

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_CD_DATA = {
    "metrics": {
        "total_produtos": 50,
        "aguardando_envio": 17,
        "tempo_medio_permanencia": 161.36,
        "eficiencia_operacional": 78,
    },
    "products": [],
}


def resolve_static_folder() -> str:
    configured_folder = os.getenv("STATIC_FOLDER")
    if configured_folder:
        return configured_folder

    dist_folder = BASE_DIR / "dist"
    return "dist" if dist_folder.exists() else "static"


app = Flask(__name__, static_folder=resolve_static_folder(), static_url_path="")

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'dashboard_meli.db'}")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JSON_SORT_KEYS"] = False

db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})
app.register_blueprint(auth_bp)


def load_cd_data() -> dict:
    candidates = [
        BASE_DIR / "src" / "meli_cd_mock_data.json",
        BASE_DIR / "meli_cd_mock_data.json",
    ]

    for candidate in candidates:
        try:
            with candidate.open("r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            continue
        except json.JSONDecodeError as error:
            app.logger.warning("Arquivo de dados inválido em %s: %s", candidate, error)

    return DEFAULT_CD_DATA


cd_data = load_cd_data()

meli_api.authenticate(
    os.getenv("MELI_ACCESS_TOKEN", "sandbox-token"),
    os.getenv("MELI_USER_ID", "123456789"),
)


def ensure_database() -> None:
    with app.app_context():
        db.create_all()
        admin_email = os.getenv("ADMIN_EMAIL", "admin@meli.com").strip().lower()
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        admin_name = os.getenv("ADMIN_NAME", "Administrador MELI")

        admin_user = User.query.filter_by(email=admin_email).first()
        if admin_user:
            return

        db.session.add(User(nome=admin_name, email=admin_email, password=admin_password))
        db.session.commit()
        app.logger.info("Usuário admin criado: %s", admin_email)


@jwt.expired_token_loader
def expired_token_callback(_jwt_header, _jwt_payload):
    return jsonify({"error": "Sessão expirada. Faça login novamente."}), 401


@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"error": f"Token inválido: {reason}"}), 401


@jwt.unauthorized_loader
def missing_token_callback(reason):
    return jsonify({"error": f"Token obrigatório: {reason}"}), 401


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "Dashboard MELI"})


@app.route("/api/cd-data", methods=["GET"])
@jwt_required()
def get_cd_data():
    return jsonify(cd_data)


@app.route("/api/products", methods=["GET"])
@jwt_required()
def get_products():
    return jsonify(cd_data.get("products", []))


@app.route("/api/metrics", methods=["GET"])
@jwt_required()
def get_metrics():
    return jsonify(cd_data.get("metrics", {}))


@app.route("/api/mercadolivre/user", methods=["GET"])
@jwt_required()
def get_meli_user():
    return jsonify(meli_api.get_user_info())


@app.route("/api/mercadolivre/products", methods=["GET"])
@jwt_required()
def get_meli_products():
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    return jsonify(meli_api.get_products(limit=max(limit, 0), offset=max(offset, 0)))


@app.route("/api/mercadolivre/orders", methods=["GET"])
@jwt_required()
def get_meli_orders():
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    return jsonify(meli_api.get_orders(limit=max(limit, 0), offset=max(offset, 0)))


@app.route("/api/mercadolivre/metrics", methods=["GET"])
@jwt_required()
def get_meli_metrics():
    return jsonify(meli_api.get_sales_metrics())


@app.route("/api/mercadolivre/questions", methods=["GET"])
@jwt_required()
def get_meli_questions():
    limit = request.args.get("limit", 20, type=int)
    return jsonify(meli_api.get_questions(limit=max(limit, 0)))


@app.route("/api/mercadolivre/notifications", methods=["GET"])
@jwt_required()
def get_meli_notifications():
    return jsonify(meli_api.get_notifications())


@app.route("/api/mercadolivre/analytics", methods=["GET"])
@jwt_required()
def get_meli_analytics():
    return jsonify(meli_api.get_analytics_data())


@app.route("/api/mercadolivre/shipping/<order_id>", methods=["GET"])
@jwt_required()
def get_meli_shipping(order_id):
    return jsonify(meli_api.get_shipping_info(order_id))


@app.route("/api/mercadolivre/products/<product_id>/stock", methods=["PUT"])
@jwt_required()
def update_meli_stock(product_id):
    payload = request.get_json(silent=True) or {}
    quantity = payload.get("quantity")

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return jsonify({"error": "quantity deve ser um número inteiro"}), 400

    if quantity < 0:
        return jsonify({"error": "quantity não pode ser negativo"}), 400

    return jsonify(meli_api.update_product_stock(product_id, quantity))


@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    requested_path = Path(app.static_folder) / path
    if requested_path.exists() and requested_path.is_file():
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


ensure_database()

if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "5000")),
    )
