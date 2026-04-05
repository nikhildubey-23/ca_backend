import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions, TouchableOpacity, Alert, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentService } from '../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function DocumentViewerScreen({ route, navigation }) {
  const { documentId, documentName, documentType } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [viewingMode, setViewingMode] = useState('loading');

  useEffect(() => {
    if (documentId) {
      loadDocument();
    } else {
      setLoading(false);
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocument(documentId);
      if (response.data.document) {
        setDocument(response.data.document);
        
        const downloadRes = await documentService.getDownloadUrl(documentId);
        if (downloadRes.data.download_url) {
          setDownloadUrl(downloadRes.data.download_url);
        }
      }
    } catch (error) {
      console.log('Error loading document:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) {
      Alert.alert('Error', 'Download URL not available');
      return;
    }

    setDownloading(true);
    
    try {
      const fileUri = FileSystem.documentDirectory + (document?.name || `document_${documentId}`);
      const extension = document?.mime_type?.split('/')[1] || 'pdf';
      const finalPath = fileUri + '.' + extension;

      const result = await FileSystem.downloadAsync(downloadUrl, finalPath);

      if (result.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: document?.mime_type || 'application/pdf',
            dialogTitle: `Share ${document?.name || 'Document'}`,
          });
        } else {
          Alert.alert('Downloaded', `File saved to: ${result.uri}`);
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenExternal = async () => {
    if (!downloadUrl) {
      Alert.alert('Error', 'URL not available');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'document-text';
    if (mimeType?.includes('image')) return 'image';
    if (mimeType?.includes('word')) return 'document';
    if (mimeType?.includes('sheet')) return 'grid';
    return 'document';
  };

  const getDocumentColor = (mimeType) => {
    if (mimeType?.includes('pdf')) return '#e74c3c';
    if (mimeType?.includes('image')) return '#27ae60';
    if (mimeType?.includes('word')) return '#3498db';
    if (mimeType?.includes('sheet')) return '#27ae60';
    return '#7f8c8d';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  if (!document && !documentId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={80} color="#bdc3c7" />
        <Text style={styles.errorTitle}>No Document Selected</Text>
        <Text style={styles.errorText}>Please select a document from the Documents screen to view it.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isImage = document?.mime_type?.includes('image');
  const isPDF = document?.mime_type?.includes('pdf');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{document?.name || 'Document'}</Text>
          <Text style={styles.headerSubtitle}>{document?.document_type || 'Document'}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.previewSection}>
          {isImage ? (
            <View style={styles.imageContainer}>
              {downloadUrl ? (
                <Image 
                  source={{ uri: downloadUrl }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noPreview}>
                  <Ionicons name="image-outline" size={80} color="#bdc3c7" />
                  <Text style={styles.noPreviewText}>Loading image...</Text>
                </View>
              )}
            </View>
          ) : isPDF ? (
            <View style={styles.pdfContainer}>
              <View style={styles.pdfPreview}>
                <Ionicons name="document-text" size={80} color="#e74c3c" />
                <Text style={styles.pdfTitle}>PDF Document</Text>
                <Text style={styles.pdfSubtitle}>{document?.name}</Text>
              </View>
              <TouchableOpacity style={styles.openPdfButton} onPress={handleOpenExternal}>
                <Ionicons name="open-outline" size={24} color="#fff" />
                <Text style={styles.openPdfText}>Open in External App</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.genericContainer}>
              <View style={[styles.fileIconContainer, { backgroundColor: getDocumentColor(document?.mime_type) + '20' }]}>
                <Ionicons 
                  name={getDocumentIcon(document?.mime_type)} 
                  size={80} 
                  color={getDocumentColor(document?.mime_type)} 
                />
              </View>
              <Text style={styles.genericTitle}>{document?.name}</Text>
              <Text style={styles.genericSubtitle}>Tap download to view this file</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="document" size={20} color="#3498db" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>File Name</Text>
                <Text style={styles.detailValue}>{document?.name || 'Unknown'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="grid" size={20} color="#27ae60" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Document Type</Text>
                <Text style={styles.detailValue}>{document?.document_type || 'Other'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calculator" size={20} color="#9b59b6" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>File Size</Text>
                <Text style={styles.detailValue}>{formatFileSize(document?.file_size)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#f39c12" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Uploaded</Text>
                <Text style={styles.detailValue}>{formatDate(document?.created_at)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="file-tray" size={20} color="#e74c3c" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Format</Text>
                <Text style={styles.detailValue}>{document?.mime_type || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.downloadButton]} 
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="download" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {Platform.OS === 'ios' ? 'Save & Share' : 'Download'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={async () => {
                if (downloadUrl) {
                  await Sharing.shareAsync(downloadUrl, {
                    mimeType: document?.mime_type,
                    dialogTitle: `Share ${document?.name}`,
                  });
                } else {
                  Alert.alert('Error', 'Document not available for sharing');
                }
              }}
            >
              <Ionicons name="share-social" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
            <Text style={styles.infoText}>
              {Platform.OS === 'ios' 
                ? 'Tap "Save & Share" to save the document and share it via other apps.'
                : 'Download the document to your device or share it directly.'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    backgroundColor: '#2c3e50',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
  },
  headerBack: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  previewSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.4,
    backgroundColor: '#f8f9fa',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreviewText: {
    marginTop: 10,
    fontSize: 14,
    color: '#7f8c8d',
  },
  pdfContainer: {
    alignItems: 'center',
    padding: 30,
  },
  pdfPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
  },
  pdfSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  openPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  openPdfText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  genericContainer: {
    alignItems: 'center',
    padding: 40,
  },
  fileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  genericTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  genericSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  detailsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
  },
  actionsSection: {
    padding: 15,
    paddingBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  downloadButton: {
    backgroundColor: '#3498db',
  },
  shareButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    lineHeight: 20,
  },
});
