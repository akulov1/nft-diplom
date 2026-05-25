import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  View, Text, Image, TouchableOpacity, TextInput,
  ScrollView, StyleSheet,
} from 'react-native-web'
import { getNFT, listNFT, buyNFT, cancelListing } from '../api'

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function resolveIPFS(url) {
  if (!url) return 'https://via.placeholder.com/600'
  if (url.startsWith('ipfs://')) return GATEWAY + url.slice(7)
  return url
}

export default function NFTScreen({ wallet }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [nft, setNft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  function loadNFT() {
    setLoading(true)
    getNFT(id)
      .then((res) => setNft(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadNFT() }, [id])

  async function handleList() {
    if (!price || !wallet) return
    setSubmitting(true)
    setMessage(null)
    try {
      await listNFT({
        nft_id: nft.id,
        seller_address: wallet,
        price_eth: parseFloat(price),
      })
      setMessage({ type: 'success', text: 'NFT listed for sale!' })
      setPrice('')
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to list' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBuy() {
    if (!wallet || !activeListing) return
    setSubmitting(true)
    setMessage(null)
    try {
      await buyNFT({
        listing_id: activeListing.id,
        buyer_address: wallet,
      })
      setMessage({ type: 'success', text: 'NFT purchased!' })
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Purchase failed' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    if (!wallet || !activeListing) return
    setSubmitting(true)
    setMessage(null)
    try {
      await cancelListing({
        listing_id: activeListing.id,
        seller_address: wallet,
      })
      setMessage({ type: 'success', text: 'Listing cancelled' })
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to cancel' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !nft) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    )
  }
  if (!nft) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>NFT not found</Text>
      </View>
    )
  }

  const isOwner = wallet && nft.owner_address?.toLowerCase() === wallet.toLowerCase()
  const activeListing = nft.listings?.[0] || null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: resolveIPFS(nft.image_url) }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.details}>
        <Text style={styles.name}>{nft.name}</Text>
        {nft.description ? (
          <Text style={styles.description}>{nft.description}</Text>
        ) : null}
        <Text style={styles.owner}>
          Owner: {nft.owner_address?.slice(0, 6)}...{nft.owner_address?.slice(-4)}
        </Text>
        {nft.token_id && (
          <Text style={styles.meta}>Token ID: {nft.token_id.toString()}</Text>
        )}
        {nft.tx_hash && (
          <Text style={styles.meta}>TX: {nft.tx_hash?.slice(0, 10)}...</Text>
        )}

        {activeListing && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{activeListing.price_eth} ETH</Text>
          </View>
        )}

        {message && (
          <View style={[styles.msgBox, message.type === 'success' ? styles.success : styles.error]}>
            <Text style={message.type === 'success' ? styles.successText : styles.errorText}>
              {message.text}
            </Text>
          </View>
        )}

        {isOwner && !activeListing && (
          <View style={styles.actionBox}>
            <Text style={styles.actionTitle}>List for sale</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Price in ETH"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.actionBtn, (!price || submitting) && styles.disabled]}
                onPress={handleList}
                disabled={!price || submitting}
              >
                <Text style={styles.actionBtnText}>
                  {submitting ? 'Listing...' : 'List'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isOwner && activeListing && (
          <TouchableOpacity
            style={[styles.cancelBtn, submitting && styles.disabled]}
            onPress={handleCancel}
            disabled={submitting}
          >
            <Text style={styles.cancelBtnText}>
              {submitting ? 'Cancelling...' : 'Cancel Listing'}
            </Text>
          </TouchableOpacity>
        )}

        {!isOwner && activeListing && (
          <TouchableOpacity
            style={[styles.buyBtn, submitting && styles.disabled]}
            onPress={handleBuy}
            disabled={submitting}
          >
            <Text style={styles.buyBtnText}>
              {submitting ? 'Processing...' : `Buy for ${activeListing.price_eth} ETH`}
            </Text>
          </TouchableOpacity>
        )}

        {!isOwner && !activeListing && (
          <Text style={styles.notForSale}>This NFT is not for sale</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24, maxWidth: 700, width: '100%', alignSelf: 'center' },
  loading: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 60 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#6c5ce7', fontWeight: '500' },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
  },
  details: { gap: 12 },
  name: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },
  owner: { fontSize: 14, color: '#888', fontFamily: 'monospace' },
  meta: { fontSize: 12, color: '#aaa', fontFamily: 'monospace' },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  priceLabel: { fontSize: 14, color: '#888' },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#6c5ce7' },
  msgBox: { padding: 12, borderRadius: 8 },
  success: { backgroundColor: '#d4edda' },
  error: { backgroundColor: '#f8d7da' },
  successText: { color: '#155724' },
  errorText: { color: '#721c24' },
  actionBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    outlineStyle: 'none',
  },
  actionBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  disabled: { opacity: 0.5 },
  buyBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#888',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  notForSale: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
})
