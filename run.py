from app import create_app, db
import os
from models.user import User
from models.document import Document
from models.folder import Folder
from models.tax_record import TaxRecord

app = create_app()
db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
