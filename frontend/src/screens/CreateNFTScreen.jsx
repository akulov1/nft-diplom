import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet,
} from 'react-native-web'
import { createNFT } from '../api'

export default function CreateNFTScreen({ wallet }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  async function handleSubmit() {
    if (!name || !file || !wallet) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('owner_address', wallet)

      const res = await createNFT(formData)
      setResult(res.data.nft)
      setName('')
      setDescription('')
      setFile(null)
      setPreview(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create NFT')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create NFT</Text>
      <Text style={styles.subtitle}>Turn your artwork into a token</Text>

      {result && (
        <View style={styles.success}>
          <Text style={styles.successText}>NFT created successfully!</Text>
          <Text style={styles.successSub}>Token ID: {result.token_id || 'pending'}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.uploadArea}>
          {preview ? (
            <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Click to upload image</Text>
              <Text style={styles.placeholderSub}>PNG, JPG, GIF, WEBP (max 50MB)</Text>
            </View>
          )}
          <input
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
            onChange={handleFile}
            style={styles.fileInput}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="NFT name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, (!name || !file || loading) && styles.disabled]}
          onPress={handleSubmit}
          disabled={!name || !file || loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Creating...' : 'Create NFT'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, marginTop: 4 },
  success: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: { color: '#155724', fontWeight: '600', fontSize: 16 },
  successSub: { color: '#155724', fontSize: 14, marginTop: 4 },
  errorBox: {
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#721c24', fontSize: 14 },
  form: { gap: 16 },
  uploadArea: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  preview: { width: '100%', height: 300 },
  placeholder: { padding: 40, alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#999', fontWeight: '500' },
  placeholderSub: { fontSize: 12, color: '#bbb', marginTop: 8 },
  fileInput: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    outlineStyle: 'none',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
