import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native-web'

const GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function resolveIPFS(url) {
  if (!url) return 'https://via.placeholder.com/300'
  if (url.startsWith('ipfs://')) return GATEWAY + url.slice(7)
  return url
}

export default function NFTCard({ nft, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(nft)}>
      <Image
        source={{ uri: resolveIPFS(nft.image_url) }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{nft.name}</Text>
        <Text style={styles.owner} numberOfLines={1}>
          {nft.owner_address?.slice(0, 6)}...{nft.owner_address?.slice(-4)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  owner: {
    fontSize: 12,
    color: '#888',
  },
})
