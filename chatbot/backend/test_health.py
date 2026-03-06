from fastapi.testclient import TestClient
from main import app

if __name__ == '__main__':
    client = TestClient(app)
    print(client.get('/health').json())
