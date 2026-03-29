import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { folderService, documentService } from '../services/api';

export default function FolderScreen({ route }) {
  const { folderId, folderName } = route.params;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState(null);

  useEffect(() => {
    loadFolderData();
  }, [folderId]);

  const loadFolderData = async () => {
    try {
      const res = await folderService.getFolderDocuments(folderId);
      setFolder(res.data.folder);
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error('Load folder data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'document-text';
    if (mimeType?.includes('image')) return 'image';
    return 'document';
  };

  const getFileColor = (mimeType) => {
    if (mimeType?.includes('pdf')) return '#e74c3c';
    if (mimeType?.includes('image')) return '#27ae60';
    return '#3498db';
  };

  const renderDocument = ({ item }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={[styles.fileIcon, { backgroundColor: getFileColor(item.mime_type) + '20' }]}>
        <Ionicons name={getFileIcon(item.mime_type)} size={28} color={getFileColor(item.mime_type)} />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.documentMeta}>
          {item.document_type} • {formatFileSize(item.file_size)}
        </Text>
      </View>
      <Ionicons name="download-outline" size={24} color="#3498db" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.folderHeader}>
        <View style={styles.folderIcon}>
          <Ionicons name="folder" size={40} color="#3498db" />
        </View>
        <View style={styles.folderInfo}>
          <Text style={styles.folderName}>{folderName}</Text>
          <Text style={styles.folderMeta}>{documents.length} documents</Text>
        </View>
      </View>

      {folder?.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{folder.description}</Text>
        </View>
      )}

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No documents in this folder</Text>
            <Text style={styles.emptySubtext}>Your CA will add documents here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  folderIcon: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  folderMeta: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  listContent: {
    padding: 15,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fileIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  documentMeta: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});
