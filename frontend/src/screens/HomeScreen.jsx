import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native-web'
import NFTCard from '../components/NFTCard'
import { getListings } from '../api'

export default function HomeScreen({ navigate }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getListings()
      .then((res) => setListings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.logoIcon}>◆</Text>
        <Text style={styles.title}>NFT Marketplace</Text>
        <Text style={styles.subtitle}>Покупайте и продавайте уникальные токены</Text>
      </View>

      <Text style={styles.sectionTitle}>Активные объявления</Text>
      <Text style={styles.sectionSub}>{listings.length} NFT в продаже</Text>

      {loading ? (
        <View style={styles.grid}>
          {[1,2,3,4].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonImg} />
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
          ))}
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Нет активных объявлений</Text>
          <Text style={styles.emptySub}>Создайте свой первый NFT!</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {listings.map((listing, i) => (
            <View key={listing.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <NFTCard
                nft={listing.nft}
                onPress={(nft) => navigate(`/nft/${nft.id}`)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060b18' },
  content: { padding: 24, maxWidth: 1000, width: '100%', alignSelf: 'center', paddingBottom: 60 },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48,
    color: '#3b82f6',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  skeletonCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    overflow: 'hidden',
    width: 260,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  skeletonImg: {
    height: 220,
    backgroundColor: '#1e293b',
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#1e293b',
    margin: 12,
    borderRadius: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
  },
})
