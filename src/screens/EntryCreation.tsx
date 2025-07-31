import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MediaEntry } from '../types';
import { COLORS } from '../constants';
import { GradientBackground } from '../components/GradientBackground';
import { useGradient } from '../hooks/useGradient';
import { RootStackParamList } from '../../App';

type EntryCreationRouteProp = RouteProp<RootStackParamList, 'EntryCreation'>;
type EntryCreationNavigationProp = StackNavigationProp<RootStackParamList, 'EntryCreation'>;

const EntryCreation: React.FC = () => {
  const navigation = useNavigation<EntryCreationNavigationProp>();
  const route = useRoute<EntryCreationRouteProp>();
  const { date, timeSlot, slotIndex, existingEntry } = route.params;
  const { getGradientForTimeSlot } = useGradient();

  const [selectedType, setSelectedType] = useState<'image' | 'note' | 'link'>(
    existingEntry?.type || 'note'
  );
  const [imageUri, setImageUri] = useState(existingEntry?.type === 'image' ? existingEntry.content : '');
  const [noteText, setNoteText] = useState(existingEntry?.type === 'note' ? existingEntry.content : '');
  const [linkUrl, setLinkUrl] = useState(existingEntry?.type === 'link' ? existingEntry.content : '');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateLink = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    let content = '';
    
    switch (selectedType) {
      case 'image':
        if (!imageUri) {
          Alert.alert('No Image', 'Please select or take a photo.');
          return;
        }
        content = imageUri;
        break;
      case 'note':
        if (!noteText.trim()) {
          Alert.alert('Empty Note', 'Please enter some text for your note.');
          return;
        }
        content = noteText.trim();
        break;
      case 'link':
        if (!linkUrl.trim()) {
          Alert.alert('No Link', 'Please enter a URL.');
          return;
        }
        if (!validateLink(linkUrl)) {
          Alert.alert('Invalid Link', 'Please enter a valid URL (e.g., https://example.com)');
          return;
        }
        content = linkUrl.trim();
        break;
    }

    const entry: MediaEntry = {
      id: existingEntry?.id || `${Date.now()}-${Math.random()}`,
      type: selectedType,
      content,
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    navigation.navigate('MainTabs', {
      screen: 'Today',
      params: {
        newEntry: {
          entry,
          date,
          timeSlot,
          slotIndex,
        },
      },
    });
  };

  const renderImagePicker = () => (
    <View style={styles.contentContainer}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => setImageUri('')}
          >
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePickerButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>Choose from Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Text style={styles.imageButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderNoteInput = () => (
    <View style={styles.contentContainer}>
      <TextInput
        style={styles.noteInput}
        placeholder="Write your thoughts..."
        placeholderTextColor="#999"
        multiline
        value={noteText}
        onChangeText={setNoteText}
        autoFocus
      />
    </View>
  );

  const renderLinkInput = () => (
    <View style={styles.contentContainer}>
      <TextInput
        style={styles.linkInput}
        placeholder="https://example.com"
        placeholderTextColor="#999"
        value={linkUrl}
        onChangeText={setLinkUrl}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
      />
    </View>
  );

  const gradientColors = getGradientForTimeSlot(timeSlot);

  return (
    <GradientBackground colors={gradientColors}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>
                {existingEntry ? 'Edit Entry' : 'New Entry'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'image' && styles.selectedType]}
                onPress={() => setSelectedType('image')}
              >
                <Text style={[styles.typeText, selectedType === 'image' && styles.selectedTypeText]}>
                  Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'note' && styles.selectedType]}
                onPress={() => setSelectedType('note')}
              >
                <Text style={[styles.typeText, selectedType === 'note' && styles.selectedTypeText]}>
                  Note
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, selectedType === 'link' && styles.selectedType]}
                onPress={() => setSelectedType('link')}
              >
                <Text style={[styles.typeText, selectedType === 'link' && styles.selectedTypeText]}>
                  Link
                </Text>
              </TouchableOpacity>
            </View>

            {selectedType === 'image' && renderImagePicker()}
            {selectedType === 'note' && renderNoteInput()}
            {selectedType === 'link' && renderLinkInput()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.primary,
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedType: {
    backgroundColor: 'white',
  },
  typeText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  selectedTypeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imagePickerButtons: {
    gap: 15,
    marginTop: 20,
  },
  imageButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    marginBottom: 15,
  },
  changeImageButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changeImageText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
    color: COLORS.text.primary,
  },
  linkInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: COLORS.text.primary,
  },
});

export default EntryCreation;