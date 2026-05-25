import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native-web'
import NFTCard from '../components/NFTCard'
import { getCollection } from '../api'

export default function CollectionScreen({ wallet, navigate }) {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wallet) return
    getCollection(wallet)
      .then((res) => setNfts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [wallet])

  const minted = nfts.filter((n) => n.is_minted)
  const pending = nfts.filter((n) => !n.is_minted)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Collection</Text>
      <Text style={styles.subtitle}>
        {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : ''}
      </Text>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : nfts.length === 0 ? (
        <Text style={styles.empty}>No NFTs yet. Create one!</Text>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pending ({pending.length})</Text>
              <View style={styles.grid}>
                {pending.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} onPress={() => navigate(`/nft/${nft.id}`)} />
                ))}
              </View>
            </>
          )}
          <Text style={styles.sectionTitle}>Minted ({minted.length})</Text>
          <View style={styles.grid}>
            {minted.map((nft) => (
              <NFTCard key={nft.id} nft={nft} onPress={() => navigate(`/nft/${nft.id}`)} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, marginTop: 4, fontFamily: 'monospace' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 60,
  },
})
