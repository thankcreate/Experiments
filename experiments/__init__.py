from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap

db = SQLAlchemy()
migrate = Migrate()
bootstrap = Bootstrap()

def create_app(config_class=Config):
    app = Flask(__name__, static_url_path='')
    app.config.from_object(Config)
    db.init_app(app)
    migrate.init_app(app, db)
    bootstrap.init_app(app)

    from .semantics import bp as sm_bp
    app.register_blueprint(sm_bp)

    from .leaderboard import bp as leaderboard_bp
    app.register_blueprint(leaderboard_bp)

    from .review import bp as review_bp
    app.register_blueprint(review_bp)


    return app

from . import models
