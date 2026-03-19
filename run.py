from app import create_app, db
from models.user import User
from models.document import Document
from models.folder import Folder
from models.tax_record import TaxRecord

app = create_app()
db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
