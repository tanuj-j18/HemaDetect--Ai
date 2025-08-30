from flask import Flask
from flask_cors import CORS
from .routes import init_routes
import logging

logger = logging.getLogger(__name__)

def create_app():
    logger.info("Creating Flask application...")
    app = Flask(__name__)
    logger.info("Configuring CORS...")
    CORS(app) 
    logger.info("Initializing routes...")
    init_routes(app)
    logger.info("Application created successfully")
    return app