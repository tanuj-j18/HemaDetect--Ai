from app import create_app
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = create_app()

if __name__ == '__main__':
    logger.info("=== Starting Melanoma Detection API ===")
    logger.info(f"Server is running at http://0.0.0.0:3000")
    logger.info("Press CTRL+C to stop the server")
    app.run(host="0.0.0.0", port=5001, debug=True)