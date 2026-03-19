from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    users = User.query.filter_by(role='user').paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

@admin_bp.route('/folders', methods=['POST'])
@jwt_required()
def create_folder():
    from models.folder import Folder
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Folder name is required'}), 400
    
    folder = Folder(
        name=data['name'],
        description=data.get('description', ''),
        is_shared=data.get('is_shared', True)
    )
    
    db.session.add(folder)
    db.session.commit()
    
    return jsonify({
        'message': 'Folder created successfully',
        'folder': folder.to_dict()
    }), 201

@admin_bp.route('/folders', methods=['GET'])
@jwt_required()
def list_all_folders():
    from models.folder import Folder
    folders = Folder.query.all()
    
    return jsonify({
        'folders': [f.to_dict() for f in folders]
    }), 200

@admin_bp.route('/documents', methods=['GET'])
@jwt_required()
def list_all_documents():
    from models.document import Document
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    documents = Document.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'documents': [d.to_dict() for d in documents.items],
        'total': documents.total,
        'pages': documents.pages,
        'current_page': page
    }), 200
