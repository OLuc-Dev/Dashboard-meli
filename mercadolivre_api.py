"""
Módulo para integração com a API do Mercado Livre
Simula funcionalidades reais que poderiam ser implementadas com a API oficial
"""

import json
import random
from datetime import datetime, timedelta

class MercadoLivreAPI:
    def __init__(self):
        self.access_token = None
        self.user_id = None
        
    def authenticate(self, access_token, user_id):
        """Simula autenticação com a API do Mercado Livre"""
        self.access_token = access_token
        self.user_id = user_id
        return {"status": "success", "message": "Autenticado com sucesso"}
    
    def get_user_info(self):
        """Retorna informações do usuário"""
        return {
            "id": self.user_id or "123456789",
            "nickname": "loja_exemplo",
            "first_name": "João",
            "last_name": "Silva",
            "email": "joao.silva@exemplo.com",
            "country_id": "BR",
            "seller_reputation": {
                "level_id": "5_green",
                "power_seller_status": "platinum",
                "transactions": {
                    "total": 15420,
                    "completed": 15380,
                    "canceled": 40
                }
            }
        }
    
    def get_products(self, limit=50, offset=0):
        """Retorna lista de produtos do vendedor"""
        products = []
        categories = ["Eletrônicos", "Casa e Jardim", "Esportes", "Moda", "Automotivo"]
        conditions = ["new", "used"]
        
        for i in range(limit):
            product_id = f"MLB{random.randint(1000000000, 9999999999)}"
            products.append({
                "id": product_id,
                "title": f"Produto Exemplo {i + offset + 1}",
                "category_id": random.choice(categories),
                "price": round(random.uniform(50, 2000), 2),
                "available_quantity": random.randint(0, 100),
                "sold_quantity": random.randint(0, 500),
                "condition": random.choice(conditions),
                "listing_type_id": "gold_special",
                "status": random.choice(["active", "paused", "closed"]),
                "permalink": f"https://produto.mercadolivre.com.br/{product_id}",
                "thumbnail": f"https://http2.mlstatic.com/D_NQ_NP_{random.randint(600000, 999999)}-O.jpg"
            })
        
        return {
            "results": products,
            "paging": {
                "total": 1247,
                "offset": offset,
                "limit": limit
            }
        }
    
    def get_orders(self, limit=50, offset=0):
        """Retorna lista de pedidos"""
        orders = []
        statuses = ["paid", "confirmed", "ready_to_ship", "shipped", "delivered"]
        
        for i in range(limit):
            order_id = random.randint(2000000000, 9999999999)
            orders.append({
                "id": order_id,
                "status": random.choice(statuses),
                "date_created": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "total_amount": round(random.uniform(50, 1000), 2),
                "currency_id": "BRL",
                "buyer": {
                    "id": random.randint(100000000, 999999999),
                    "nickname": f"comprador{random.randint(1, 1000)}"
                },
                "order_items": [{
                    "item": {
                        "id": f"MLB{random.randint(1000000000, 9999999999)}",
                        "title": f"Produto Vendido {i + 1}",
                        "category_id": random.choice(["Eletrônicos", "Casa", "Moda"]),
                        "unit_price": round(random.uniform(50, 500), 2),
                        "quantity": random.randint(1, 3)
                    }
                }]
            })
        
        return {
            "results": orders,
            "paging": {
                "total": 892,
                "offset": offset,
                "limit": limit
            }
        }
    
    def get_sales_metrics(self):
        """Retorna métricas de vendas"""
        today = datetime.now()
        return {
            "today": {
                "sales_count": random.randint(80, 120),
                "revenue": round(random.uniform(40000, 60000), 2),
                "orders_pending": random.randint(15, 35)
            },
            "this_month": {
                "sales_count": random.randint(2000, 3000),
                "revenue": round(random.uniform(800000, 1200000), 2),
                "orders_pending": random.randint(100, 200)
            },
            "last_30_days": {
                "sales_count": random.randint(2500, 3500),
                "revenue": round(random.uniform(1000000, 1500000), 2),
                "conversion_rate": round(random.uniform(3.5, 6.8), 2)
            }
        }
    
    def get_questions(self, limit=20):
        """Retorna perguntas dos compradores"""
        questions = []
        sample_questions = [
            "Qual o prazo de entrega para São Paulo?",
            "Tem garantia? Por quanto tempo?",
            "Aceita cartão de crédito?",
            "Tem desconto para pagamento à vista?",
            "Qual a cor disponível?",
            "Tem nota fiscal?",
            "Faz entrega no mesmo dia?",
            "Qual o peso do produto?"
        ]
        
        for i in range(limit):
            questions.append({
                "id": random.randint(1000000, 9999999),
                "text": random.choice(sample_questions),
                "status": random.choice(["UNANSWERED", "ANSWERED"]),
                "date_created": (datetime.now() - timedelta(hours=random.randint(1, 72))).isoformat(),
                "from": {
                    "id": random.randint(100000000, 999999999),
                    "answered_questions": random.randint(0, 50)
                },
                "item_id": f"MLB{random.randint(1000000000, 9999999999)}"
            })
        
        return {
            "questions": questions,
            "total": len(questions)
        }
    
    def get_notifications(self):
        """Retorna notificações importantes"""
        notifications = [
            {
                "id": 1,
                "type": "low_stock",
                "title": "Estoque baixo",
                "message": "5 produtos com estoque abaixo de 10 unidades",
                "priority": "medium",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "type": "new_question",
                "title": "Nova pergunta",
                "message": "Você tem 3 perguntas não respondidas",
                "priority": "high",
                "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                "id": 3,
                "type": "payment_received",
                "title": "Pagamento aprovado",
                "message": "Pedido #2087654321 - R$ 299,90",
                "priority": "low",
                "created_at": (datetime.now() - timedelta(hours=1)).isoformat()
            }
        ]
        
        return {"notifications": notifications}
    
    def get_shipping_info(self, order_id):
        """Retorna informações de envio de um pedido"""
        return {
            "order_id": order_id,
            "shipment_id": random.randint(20000000000, 29999999999),
            "status": random.choice(["ready_to_ship", "shipped", "delivered"]),
            "tracking_number": f"BR{random.randint(100000000, 999999999)}BR",
            "estimated_delivery": (datetime.now() + timedelta(days=random.randint(3, 10))).isoformat(),
            "shipping_option": {
                "name": "Mercado Envios",
                "shipping_method_id": random.randint(100, 999),
                "cost": round(random.uniform(15, 45), 2)
            }
        }
    
    def update_product_stock(self, product_id, quantity):
        """Atualiza estoque de um produto"""
        return {
            "product_id": product_id,
            "available_quantity": quantity,
            "status": "success",
            "message": f"Estoque atualizado para {quantity} unidades"
        }
    
    def get_analytics_data(self):
        """Retorna dados analíticos detalhados"""
        return {
            "visits": {
                "total": random.randint(15000, 25000),
                "unique": random.randint(8000, 15000),
                "conversion_rate": round(random.uniform(2.5, 5.8), 2)
            },
            "top_products": [
                {
                    "id": f"MLB{random.randint(1000000000, 9999999999)}",
                    "title": "Smartphone Samsung Galaxy",
                    "sales": random.randint(50, 150),
                    "revenue": round(random.uniform(15000, 45000), 2)
                },
                {
                    "id": f"MLB{random.randint(1000000000, 9999999999)}",
                    "title": "Notebook Lenovo IdeaPad",
                    "sales": random.randint(30, 80),
                    "revenue": round(random.uniform(25000, 60000), 2)
                }
            ],
            "categories_performance": [
                {"category": "Eletrônicos", "sales": 45, "revenue": 89500},
                {"category": "Casa e Jardim", "sales": 32, "revenue": 15600},
                {"category": "Moda", "sales": 28, "revenue": 8900}
            ]
        }

# Instância global da API
meli_api = MercadoLivreAPI()

