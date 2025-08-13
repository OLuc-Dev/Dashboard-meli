from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import os
import json
from mercadolivre_api import meli_api
from models import db, bcrypt, User
from auth import auth_bp

# Configurar o Flask para servir os arquivos estáticos do React
app = Flask(__name__, 
            static_folder='static',
            static_url_path='')

# Configurações
app.config['SECRET_KEY'] = 'meli-dashboard-secret-key-2024'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-meli-dashboard'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dashboard_meli.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar extensões
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Habilitar CORS para permitir requisições do frontend
CORS(app)

# Registrar blueprints
app.register_blueprint(auth_bp)

# Carregar os dados do Cross Docking MELI
try:
    with open('src/meli_cd_mock_data.json', 'r', encoding='utf-8') as f:
        cd_data = json.load(f)
except FileNotFoundError:
    # Dados de fallback caso o arquivo não seja encontrado
    cd_data = {
        "metrics": {
            "total_produtos": 50,
            "aguardando_envio": 17,
            "tempo_medio_permanencia": 161.36,
            "eficiencia_operacional": 78
        },
        "products": []
    }

# Simular autenticação com Mercado Livre
meli_api.authenticate("APP_USR-123456789-abcdef", "123456789")

@app.route('/api/cd-data', methods=['GET'])
@jwt_required()
def get_cd_data():
    return jsonify(cd_data)

@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    return jsonify(cd_data.get('products', []))

@app.route('/api/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    return jsonify(cd_data.get('metrics', {}))

# Rotas da API do Mercado Livre
@app.route('/api/mercadolivre/user', methods=['GET'])
@jwt_required()
def get_meli_user():
    """Retorna informações do usuário do Mercado Livre"""
    return jsonify(meli_api.get_user_info())

@app.route('/api/mercadolivre/products', methods=['GET'])
@jwt_required()
def get_meli_products():
    """Retorna produtos do Mercado Livre"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    return jsonify(meli_api.get_products(limit, offset))

@app.route('/api/mercadolivre/orders', methods=['GET'])
@jwt_required()
def get_meli_orders():
    """Retorna pedidos do Mercado Livre"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    return jsonify(meli_api.get_orders(limit, offset))

@app.route('/api/mercadolivre/metrics', methods=['GET'])
@jwt_required()
def get_meli_metrics():
    """Retorna métricas de vendas do Mercado Livre"""
    return jsonify(meli_api.get_sales_metrics())

@app.route('/api/mercadolivre/questions', methods=['GET'])
@jwt_required()
def get_meli_questions():
    """Retorna perguntas dos compradores"""
    limit = request.args.get('limit', 20, type=int)
    return jsonify(meli_api.get_questions(limit))

@app.route('/api/mercadolivre/notifications', methods=['GET'])
@jwt_required()
def get_meli_notifications():
    """Retorna notificações importantes"""
    return jsonify(meli_api.get_notifications())

@app.route('/api/mercadolivre/analytics', methods=['GET'])
@jwt_required()
def get_meli_analytics():
    """Retorna dados analíticos detalhados"""
    return jsonify(meli_api.get_analytics_data())

@app.route('/api/mercadolivre/shipping/<order_id>', methods=['GET'])
@jwt_required()
def get_meli_shipping(order_id):
    """Retorna informações de envio de um pedido"""
    return jsonify(meli_api.get_shipping_info(order_id))

@app.route('/api/mercadolivre/products/<product_id>/stock', methods=['PUT'])
@jwt_required()
def update_meli_stock(product_id):
    """Atualiza estoque de um produto"""
    data = request.get_json()
    quantity = data.get('quantity', 0)
    return jsonify(meli_api.update_product_stock(product_id, quantity))

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Servir arquivos estáticos diretamente
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Para SPA routing, servir o index.html para rotas não encontradas
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        # Criar tabelas do banco de dados
        db.create_all()
        
        # Criar usuário admin padrão se não existir
        admin_user = User.query.filter_by(email='admin@meli.com').first()
        if not admin_user:
            admin_user = User(
                nome='Administrador MELI',
                email='admin@meli.com',
                password='admin123'
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Usuário admin criado: admin@meli.com / admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

