import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { folderService, documentService } from '../services/api';
import * as DocumentPicker from 'expo-document-picker';

const DOCUMENT_TYPES = [
  { id: 'form16', name: 'Form 16' },
  { id: 'form26as', name: 'Form 26AS' },
  { id: 'itr', name: 'ITR Receipt' },
  { id: 'investment', name: 'Investment Proof' },
  { id: 'pan_card', name: 'PAN Card' },
  { id: 'aadhar', name: 'Aadhar Card' },
  { id: 'salary_slip', name: 'Salary Slip' },
  { id: 'bank_statement', name: 'Bank Statement' },
  { id: 'other', name: 'Other' },
];

export default function DocumentsScreen({ navigation }) {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('other');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foldersRes, docsRes] = await Promise.all([
        folderService.getFolders(),
        documentService.getDocuments(),
      ]);
      setFolders(foldersRes.data.folders || []);
      setDocuments(docsRes.data.documents || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      });
      formData.append('document_type', selectedType);
      if (selectedFolder) {
        formData.append('folder_id', selectedFolder);
      }

      await documentService.uploadDocument(formData);
      Alert.alert('Success', 'Document uploaded successfully');
      setUploadModalVisible(false);
      setSelectedFile(null);
      setSelectedType('other');
      setSelectedFolder(null);
      loadData();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id) => {
    Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await documentService.deleteDocument(id);
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete document');
          }
        },
      },
    ]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'document-text';
    if (mimeType?.includes('image')) return 'image';
    return 'document';
  };

  const renderFolder = ({ item }) => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => navigation.navigate('FolderDetail', { folderId: item.id, folderName: item.name })}
    >
      <View style={styles.folderIcon}>
        <Ionicons name="folder" size={32} color="#3498db" />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderMeta}>{item.document_count || 0} documents</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );

  const renderDocument = ({ item }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <Ionicons name={getFileIcon(item.mime_type)} size={28} color="#e74c3c" />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.documentMeta}>
          {item.document_type} • {formatFileSize(item.file_size || 0)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteDocument(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
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
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>Documents</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'folders' && styles.activeTab]}
          onPress={() => setActiveTab('folders')}
        >
          <Text style={[styles.tabText, activeTab === 'folders' && styles.activeTabText]}>Folders</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'documents' ? (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No documents yet</Text>
              <Text style={styles.emptySubtext}>Upload your tax documents</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No folders yet</Text>
              <Text style={styles.emptySubtext}>Your CA will share folders with you</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={pickDocument} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="add" size={30} color="#fff" />
        )}
      </TouchableOpacity>

      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {selectedFile && (
              <View style={styles.filePreview}>
                <Ionicons name={getFileIcon(selectedFile.mimeType)} size={40} color="#e74c3c" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>{formatFileSize(selectedFile.size || 0)}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.pickerLabel}>Document Type</Text>
              <View style={styles.pickerValue}>
                <Text style={styles.pickerText}>
                  {DOCUMENT_TYPES.find(t => t.id === selectedType)?.name || 'Select Type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}>
              <Text style={styles.pickerLabel}>Folder (Optional)</Text>
              <View style={styles.pickerValue}>
                <Text style={styles.pickerText}>
                  {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'No Folder'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTypePicker} transparent animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Document Type</Text>
            {DOCUMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedType(type.id);
                  setShowTypePicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, selectedType === type.id && styles.pickerOptionSelected]}>
                  {type.name}
                </Text>
                {selectedType === type.id && <Ionicons name="checkmark" size={20} color="#3498db" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFolderPicker} transparent animationType="fade" onRequestClose={() => setShowFolderPicker(false)}>
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setShowFolderPicker(false)}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Folder</Text>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => {
                setSelectedFolder(null);
                setShowFolderPicker(false);
              }}
            >
              <Text style={[styles.pickerOptionText, selectedFolder === null && styles.pickerOptionSelected]}>No Folder</Text>
              {selectedFolder === null && <Ionicons name="checkmark" size={20} color="#3498db" />}
            </TouchableOpacity>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedFolder(folder.id);
                  setShowFolderPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, selectedFolder === folder.id && styles.pickerOptionSelected]}>
                  {folder.name}
                </Text>
                {selectedFolder === folder.id && <Ionicons name="checkmark" size={20} color="#3498db" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', padding: 5, margin: 15, borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#3498db' },
  tabText: { fontSize: 14, color: '#7f8c8d', fontWeight: '500' },
  activeTabText: { color: '#fff' },
  listContent: { padding: 15, paddingBottom: 100 },
  folderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  folderIcon: { marginRight: 15 },
  folderInfo: { flex: 1 },
  folderName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  folderMeta: { fontSize: 12, color: '#7f8c8d', marginTop: 3 },
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  documentIcon: { marginRight: 15 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  documentMeta: { fontSize: 12, color: '#7f8c8d', marginTop: 3 },
  deleteBtn: { padding: 5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginTop: 15 },
  emptySubtext: { fontSize: 14, color: '#7f8c8d', marginTop: 5 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  filePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 10, padding: 15, marginBottom: 20 },
  fileInfo: { flex: 1, marginLeft: 15 },
  fileName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  fileSize: { fontSize: 12, color: '#7f8c8d', marginTop: 3 },
  pickerButton: { backgroundColor: '#f8f9fa', borderRadius: 10, padding: 15, marginBottom: 15 },
  pickerLabel: { fontSize: 12, color: '#7f8c8d', marginBottom: 5 },
  pickerValue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { fontSize: 16, color: '#2c3e50' },
  uploadButton: { backgroundColor: '#27ae60', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  uploadButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  pickerModalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, width: '100%', maxHeight: '70%' },
  pickerModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  pickerOptionText: { fontSize: 16, color: '#2c3e50' },
  pickerOptionSelected: { color: '#3498db', fontWeight: '600' },
});
