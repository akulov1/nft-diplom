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
  const [imgLoaded, setImgLoaded] = useState(false)
  const [listHover, setListHover] = useState(false)
  const [buyHover, setBuyHover] = useState(false)
  const [cancelHover, setCancelHover] = useState(false)

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
      setMessage({ type: 'success', text: 'NFT выставлен на продажу!' })
      setPrice('')
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Ошибка листинга' })
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
      setMessage({ type: 'success', text: 'NFT куплен!' })
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Ошибка покупки' })
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
      setMessage({ type: 'success', text: 'Объявление отменено' })
      loadNFT()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Ошибка отмены' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !nft) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingWrap}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLineWide} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
        </View>
      </View>
    )
  }
  if (!nft) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>NFT не найден</Text>
      </View>
    )
  }

  const isOwner = wallet && nft.owner_address?.toLowerCase() === wallet.toLowerCase()
  const activeListing = nft.listings?.[0] || null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      <View style={styles.mainRow}>
        <View style={styles.imageWrap}>
          {!imgLoaded && (
            <View style={styles.imgSkeleton} />
          )}
          <Image
            source={{ uri: resolveIPFS(nft.image_url) }}
            style={[styles.image, !imgLoaded && styles.hidden]}
            resizeMode="contain"
            onLoad={() => setImgLoaded(true)}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{nft.name}</Text>
          {nft.description ? (
            <Text style={styles.description}>{nft.description}</Text>
          ) : null}

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Владелец</Text>
              <Text style={styles.metaValue}>
                {nft.owner_address?.slice(0, 6)}...{nft.owner_address?.slice(-4)}
              </Text>
            </View>
            {nft.token_id && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Token ID</Text>
                <Text style={styles.metaValue}>{nft.token_id.toString()}</Text>
              </View>
            )}
            {nft.tx_hash && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Транзакция</Text>
                <Text style={styles.metaValue}>{nft.tx_hash?.slice(0, 12)}...</Text>
              </View>
            )}
          </View>

          {activeListing && (
            <View style={styles.priceBadge}>
              <View>
                <Text style={styles.priceLabel}>Цена</Text>
                <Text style={styles.priceValue}>{activeListing.price_eth} ETH</Text>
              </View>
              <View style={styles.priceGlow} />
            </View>
          )}

          {message && (
            <View style={[styles.msgBox, message.type === 'success' ? styles.successMsg : styles.errorMsg]}>
              <Text style={message.type === 'success' ? styles.successText : styles.errorText}>
                {message.text}
              </Text>
            </View>
          )}

          {isOwner && !activeListing && (
            <View style={styles.actionBox}>
              <Text style={styles.actionTitle}>Выставить на продажу</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Цена в ETH"
                  placeholderTextColor="#475569"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.listBtn, (!price || submitting) && styles.disabled]}
                  onPress={handleList}
                  disabled={!price || submitting}
                  onMouseEnter={() => setListHover(true)}
                  onMouseLeave={() => setListHover(false)}
                >
                  <Text style={styles.listBtnText}>
                    {submitting ? 'Выставление...' : 'Продать'}
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
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
            >
              <Text style={styles.cancelBtnText}>
                {submitting ? 'Отмена...' : 'Отменить продажу'}
              </Text>
            </TouchableOpacity>
          )}

          {!isOwner && activeListing && (
            <TouchableOpacity
              style={[styles.buyBtn, submitting && styles.disabled]}
              onPress={handleBuy}
              disabled={submitting}
              onMouseEnter={() => setBuyHover(true)}
              onMouseLeave={() => setBuyHover(false)}
            >
              <Text style={styles.buyBtnText}>
                {submitting ? 'Покупка...' : `Купить за ${activeListing.price_eth} ETH`}
              </Text>
            </TouchableOpacity>
          )}

          {!isOwner && !activeListing && (
            <View style={styles.notForSaleBox}>
              <Text style={styles.notForSale}>Этот NFT не продаётся</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060b18' },
  content: { padding: 24, maxWidth: 900, width: '100%', alignSelf: 'center', paddingBottom: 60 },
  loadingWrap: { padding: 24, maxWidth: 900, width: '100%', alignSelf: 'center' },
  skeletonImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 24,
  },
  skeletonLine: { height: 16, backgroundColor: '#1e293b', borderRadius: 6, marginBottom: 12 },
  skeletonLineWide: { height: 24, backgroundColor: '#1e293b', borderRadius: 6, marginBottom: 12, width: '80%' },
  notFound: { fontSize: 18, color: '#94a3b8', textAlign: 'center', marginTop: 60 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  backArrow: { fontSize: 20, color: '#3b82f6' },
  backText: { fontSize: 16, color: '#3b82f6', fontWeight: '500' },
  mainRow: {
    flexDirection: 'row',
    gap: 32,
    flexWrap: 'wrap',
  },
  imageWrap: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
  },
  imgSkeleton: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: 450,
    transition: 'opacity 0.3s ease',
  },
  hidden: { opacity: 0 },
  details: {
    flex: 1,
    minWidth: 300,
    gap: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  metaGrid: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    color: '#f1f5f9',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
    position: 'relative',
    overflow: 'hidden',
  },
  priceLabel: { fontSize: 14, color: '#64748b' },
  priceValue: { fontSize: 24, fontWeight: '700', color: '#3b82f6', marginTop: 4 },
  priceGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  msgBox: {
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successMsg: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  errorMsg: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  successText: { color: '#22c55e', fontSize: 14, fontWeight: '500' },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
  actionBox: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
    color: '#f1f5f9',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    outlineStyle: 'none',
    backgroundColor: '#060b18',
    color: '#f1f5f9',
    transition: 'border-color 0.2s ease',
  },
  listBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
    transition: 'all 0.2s ease',
  },
  listBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  disabled: { opacity: 0.5 },
  buyBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    transition: 'all 0.2s ease',
  },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    transition: 'all 0.2s ease',
  },
  cancelBtnText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  notForSaleBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  notForSale: {
    fontSize: 15,
    color: '#64748b',
  },
})
