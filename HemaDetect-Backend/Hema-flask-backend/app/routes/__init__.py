from .home import register_home_route
from .predict import register_predict_route
from .predicttwo import register_predicttwo_route
from .predictthree import register_predictthree_route

def init_routes(app):
    register_home_route(app)
    register_predict_route(app)
    register_predicttwo_route(app)
    register_predictthree_route(app)