import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native-web'
import NFTCard from '../components/NFTCard'
import { getListings } from '../api'

export default function HomeScreen({ navigate }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getListings()
      .then((res) => setListings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Marketplace</Text>
      <Text style={styles.subtitle}>Browse available NFTs</Text>

      {loading ? (
        <Text style={styles.empty}>Loading...</Text>
      ) : listings.length === 0 ? (
        <Text style={styles.empty}>No NFTs listed yet</Text>
      ) : (
        <View style={styles.grid}>
          {listings.map((listing) => (
            <NFTCard
              key={listing.id}
              nft={listing.nft}
              onPress={(nft) => navigate(`/nft/${nft.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  empty: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 60,
  },
})
