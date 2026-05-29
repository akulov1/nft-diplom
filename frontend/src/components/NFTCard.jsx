import { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native-web'

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function resolveIPFS(url) {
  if (!url) return 'https://via.placeholder.com/300'
  if (url.startsWith('ipfs://')) return GATEWAY + url.slice(7)
  return url
}

export default function NFTCard({ nft, onPress, style }) {
  const [hovered, setHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <TouchableOpacity
      style={[styles.card, hovered && styles.cardHover, style]}
      onPress={() => onPress?.(nft)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <View style={styles.imageWrap}>
        {!imgLoaded && <View style={styles.skeleton} />}
        <Image
          source={{ uri: resolveIPFS(nft.image_url) }}
          style={[styles.image, !imgLoaded && styles.hidden]}
          resizeMode="cover"
          onLoad={() => setImgLoaded(true)}
        />
        <View style={[styles.overlay, hovered && styles.overlayVisible]}>
          <Text style={styles.viewText}>Открыть</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{nft.name}</Text>
        <View style={styles.ownerRow}>
          <View style={styles.ownerDot} />
          <Text style={styles.owner} numberOfLines={1}>
            {nft.owner_address?.slice(0, 6)}...{nft.owner_address?.slice(-4)}
          </Text>
        </View>
        {nft.is_minted && (
          <View style={styles.mintedBadge}>
            <Text style={styles.mintedText}>Заминчен</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
    width: '100%',
    maxWidth: 280,
  },
  cardHover: {
    borderColor: '#3b82f6',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(59,130,246,0.15)',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#0f172a',
  },
  skeleton: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#1e293b',
    borderRadius: 14,
  },
  image: {
    width: '100%',
    height: 220,
    transition: 'opacity 0.3s ease',
  },
  hidden: {
    opacity: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(59,130,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  overlayVisible: {
    opacity: 1,
  },
  viewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  info: {
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  owner: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  mintedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  mintedText: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '500',
  },
})
