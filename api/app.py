from flask import Flask
# import blueprints from the api.routes package
from api.routes import auth, users, menu, orders, admin

# config imports will be resolved when using fully qualified path


def create_app(config_object="api.config.Config"):
    """Application factory for the Flask app."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    # register blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(menu.bp)
    app.register_blueprint(orders.bp)
    app.register_blueprint(admin.bp)

    return app


if __name__ == '__main__':
    # simple runner for development
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
