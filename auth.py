import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token as mint_jwt, get_jwt_identity, jwt_required

from models import User, db


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_PATTERN.match(email or ""))


def validate_password(password: str):
    if len(password or "") < 8:
        return False, "A senha deve ter pelo menos 8 caracteres"

    if not re.search(r"[A-Za-z]", password):
        return False, "A senha deve conter pelo menos uma letra"

    if not re.search(r"\d", password):
        return False, "A senha deve conter pelo menos um número"

    return True, "Senha válida"


def get_user_by_id(user_id):
    try:
        return db.session.get(User, int(user_id))
    except (TypeError, ValueError):
        return None


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        nome = data.get("nome", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if len(nome) < 2:
            return jsonify({"error": "Nome deve ter pelo menos 2 caracteres"}), 400

        if not validate_email(email):
            return jsonify({"error": "Email inválido"}), 400

        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            return jsonify({"error": password_message}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Este email já está cadastrado"}), 409

        new_user = User(nome=nome, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        token = mint_jwt(identity=str(new_user.id))

        return jsonify({
            "message": "Conta criada com sucesso",
            "access_token": token,
            "user": new_user.to_dict(),
        }), 201
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email e senha são obrigatórios"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Email ou senha incorretos"}), 401

        if not user.is_active:
            return jsonify({"error": "Conta desativada. Entre em contato com o suporte."}), 403

        token = mint_jwt(identity=str(user.id))

        return jsonify({
            "message": "Login realizado com sucesso",
            "access_token": token,
            "user": user.to_dict(),
        }), 200
    except Exception:
        return jsonify({"error": "Erro interno do servidor"}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        user = get_user_by_id(get_jwt_identity())
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({"user": user.to_dict()}), 200
    except Exception:
        return jsonify({"error": "Erro interno do servidor"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Logout realizado com sucesso"}), 200
