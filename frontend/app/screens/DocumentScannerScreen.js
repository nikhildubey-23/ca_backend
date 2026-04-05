import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const DOCUMENT_TYPES = [
  { id: 'form16', name: 'Form 16', icon: 'document-text', color: '#3498db' },
  { id: 'form26as', name: 'Form 26AS', icon: 'document-text', color: '#9b59b6' },
  { id: 'itr', name: 'ITR Receipt', icon: 'receipt', color: '#27ae60' },
  { id: 'investment', name: 'Investment Proof', icon: 'trending-up', color: '#e74c3c' },
  { id: 'pan_card', name: 'PAN Card', icon: 'card', color: '#f39c12' },
  { id: 'aadhar', name: 'Aadhar Card', icon: 'person', color: '#1abc9c' },
  { id: 'salary_slip', name: 'Salary Slip', icon: 'cash', color: '#2ecc71' },
  { id: 'bank_statement', name: 'Bank Statement', icon: 'business', color: '#34495e' },
  { id: 'other', name: 'Other', icon: 'document', color: '#7f8c8d' },
];

export default function DocumentScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to scan documents.');
      return;
    }

    Alert.alert(
      'Choose Option',
      'How would you like to capture your document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
              aspect: [3, 4],
            });

            if (!result.canceled) {
              setCapturedImage(result.assets[0]);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) {
              Alert.alert('Permission Required', 'Gallery permission is required.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
              aspect: [3, 4],
            });

            if (!result.canceled) {
              setCapturedImage(result.assets[0]);
            }
          },
        },
      ]
    );
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Gallery permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0]);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setSelectedDocType(null);
    setDescription('');
  };

  const handleUpload = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please capture or select a document first.');
      return;
    }

    if (!selectedDocType) {
      Alert.alert('Error', 'Please select a document type.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: capturedImage.uri,
        name: `doc_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      formData.append('document_type', selectedDocType);
      if (description) {
        formData.append('description', description);
      }

      Alert.alert(
        'Success',
        'Document scanned and ready for upload! In production, this would upload to your backend.',
        [{ text: 'OK', onPress: resetCapture }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getDocTypeIcon = (iconName) => {
    switch (iconName) {
      case 'document-text': return 'document-text';
      case 'receipt': return 'receipt';
      case 'trending-up': return 'trending-up';
      case 'card': return 'card';
      case 'person': return 'person';
      case 'cash': return 'cash';
      case 'business': return 'business';
      default: return 'document';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Scanner</Text>
        <Text style={styles.headerSubtitle}>Scan and upload your tax documents</Text>
      </View>

      <ScrollView style={styles.content}>
        {!capturedImage ? (
          <View style={styles.captureSection}>
            <View style={styles.captureCard}>
              <View style={styles.placeholderIcon}>
                <Ionicons name="document-text" size={64} color="#bdc3c7" />
              </View>
              <Text style={styles.captureTitle}>Capture Your Document</Text>
              <Text style={styles.captureSubtitle}>
                Take a photo or select from gallery
              </Text>

              <View style={styles.captureButtons}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                  <View style={[styles.captureIcon, { backgroundColor: '#3498db' }]}>
                    <Ionicons name="camera" size={28} color="#fff" />
                  </View>
                  <Text style={styles.captureButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.captureButton} onPress={selectFromGallery}>
                  <View style={[styles.captureIcon, { backgroundColor: '#27ae60' }]}>
                    <Ionicons name="images" size={28} color="#fff" />
                  </View>
                  <Text style={styles.captureButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Tips for best results:</Text>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                <Text style={styles.tipText}>Ensure good lighting</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                <Text style={styles.tipText}>Keep the document flat</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                <Text style={styles.tipText}>Hold the camera steady</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                <Text style={styles.tipText}>Include all edges</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.previewCard}>
              <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.retakeButton} onPress={resetCapture}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.typeSection}>
              <Text style={styles.sectionTitle}>Select Document Type</Text>
              <View style={styles.typeGrid}>
                {DOCUMENT_TYPES.map((docType) => (
                  <TouchableOpacity
                    key={docType.id}
                    style={[
                      styles.typeCard,
                      selectedDocType === docType.id && { borderColor: docType.color, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedDocType(docType.id)}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: docType.color + '20' }]}>
                      <Ionicons name={getDocTypeIcon(docType.icon)} size={24} color={docType.color} />
                    </View>
                    <Text style={styles.typeName}>{docType.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={styles.descInput}
                placeholder="Add a note about this document..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.uploadButton, (!selectedDocType || uploading) && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={!selectedDocType || uploading}
            >
              <Ionicons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Processing...' : 'Upload Document'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Quick Scan Categories</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { name: 'Form 16', desc: 'TDS Certificate', icon: 'document-text', color: '#3498db' },
              { name: 'Form 26AS', desc: 'Tax Statement', icon: 'grid', color: '#9b59b6' },
              { name: 'Receipts', desc: 'Investment proofs', icon: 'receipt', color: '#27ae60' },
              { name: 'Salary', desc: 'Pay slips', icon: 'cash', color: '#f39c12' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickCard}
                onPress={() => {
                  setSelectedDocType(item.name.toLowerCase().replace(' ', '_'));
                  takePhoto();
                }}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.quickName}>{item.name}</Text>
                <Text style={styles.quickDesc}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  captureSection: {},
  captureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  captureSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  captureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  captureButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  previewSection: {},
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    padding: 12,
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  typeSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  typeIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  descSection: {
    marginTop: 20,
  },
  descInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  uploadButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  recentSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  quickCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  quickDesc: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
    textAlign: 'center',
  },
});
