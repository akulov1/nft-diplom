import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native-web'
import NFTCard from '../components/NFTCard'
import { getCollection } from '../api'

export default function CollectionScreen({ wallet, navigate }) {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    getCollection(wallet)
      .then((res) => setNfts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [wallet])

  const minted = nfts.filter((n) => n.is_minted)
  const pending = nfts.filter((n) => !n.is_minted)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Мои NFT</Text>
        <Text style={styles.subtitle}>
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : ''}
        </Text>
      </View>

      {loading ? (
        <View style={styles.grid}>
          {[1,2,3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonImg} />
              <View style={styles.skeletonLine} />
            </View>
          ))}
        </View>
      ) : nfts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎨</Text>
          <Text style={styles.emptyText}>У вас пока нет NFT</Text>
          <Text style={styles.emptySub}>Создайте свой первый токен!</Text>
        </View>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>В обработке ({pending.length})</Text>
              <View style={styles.grid}>
                {pending.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} onPress={() => navigate(`/nft/${nft.id}`)} />
                ))}
              </View>
            </>
          )}
          <Text style={styles.sectionTitle}>Заминтировано ({minted.length})</Text>
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
  container: { flex: 1, backgroundColor: '#060b18' },
  content: { padding: 24, maxWidth: 1000, width: '100%', alignSelf: 'center', paddingBottom: 60 },
  hero: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748b', fontFamily: 'monospace', marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 14,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  skeletonCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    overflow: 'hidden',
    width: 260,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  skeletonImg: { height: 220, backgroundColor: '#1e293b' },
  skeletonLine: { height: 14, backgroundColor: '#1e293b', margin: 12, borderRadius: 4 },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#64748b' },
})
