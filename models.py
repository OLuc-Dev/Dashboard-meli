from datetime import datetime

from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """Modelo de usuário para autenticação."""

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def __init__(self, nome, email, password):
        self.nome = nome.strip()
        self.email = email.strip().lower()
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """Verifica se a senha fornecida está correta."""
        return bcrypt.check_password_hash(self.password_hash, password or "")

    def to_dict(self):
        """Converte o usuário para dicionário sem expor a senha."""
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }

    def __repr__(self):
        return f"<User {self.email}>"
