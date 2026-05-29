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
      setError(e.response?.data?.error || 'Ошибка создания NFT')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Создать NFT</Text>
        <Text style={styles.subtitle}>Превратите ваше изображение в токен</Text>
      </View>

      {result && (
        <View style={styles.success}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>NFT успешно создан!</Text>
          <Text style={styles.successSub}>Token ID: {result.token_id || 'в обработке'}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <TouchableOpacity style={styles.uploadArea} onPress={() => document.getElementById('fileInput')?.click()}>
          {preview ? (
            <Image source={{ uri: preview }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>+</Text>
              <Text style={styles.placeholderText}>Нажмите для загрузки</Text>
              <Text style={styles.placeholderSub}>PNG, JPG, GIF, WEBP (до 50MB)</Text>
            </View>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
            onChange={handleFile}
            style={styles.fileInput}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Название NFT"
          placeholderTextColor="#475569"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Описание (необязательно)"
          placeholderTextColor="#475569"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, (!name || !file || loading) && styles.disabled, (name && file && !loading) && styles.submitBtnActive]}
          onPress={handleSubmit}
          disabled={!name || !file || loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Создание...' : 'Создать NFT'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060b18' },
  content: { padding: 24, maxWidth: 600, width: '100%', alignSelf: 'center', paddingBottom: 60 },
  hero: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 20,
    color: '#22c55e',
    fontWeight: '700',
  },
  successText: { color: '#22c55e', fontWeight: '600', fontSize: 16 },
  successSub: { color: '#22c55e', fontSize: 14, marginTop: 4, opacity: 0.8 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorIcon: { fontSize: 18, color: '#ef4444', fontWeight: '700' },
  errorText: { color: '#ef4444', fontSize: 14 },
  form: { gap: 16 },
  uploadArea: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#0f172a',
    transition: 'border-color 0.2s ease',
  },
  preview: { width: '100%', height: 300 },
  placeholder: { padding: 40, alignItems: 'center' },
  placeholderIcon: {
    fontSize: 36,
    color: '#3b82f6',
    fontWeight: '300',
    marginBottom: 12,
  },
  placeholderText: { fontSize: 16, color: '#94a3b8', fontWeight: '500' },
  placeholderSub: { fontSize: 12, color: '#475569', marginTop: 8 },
  fileInput: {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    outlineStyle: 'none',
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    transition: 'border-color 0.2s ease',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  submitBtnActive: {
    backgroundColor: '#3b82f6',
  },
  disabled: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
