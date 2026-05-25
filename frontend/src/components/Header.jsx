import { View, Text, TouchableOpacity, StyleSheet } from 'react-native-web'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Header({ wallet, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Market', path: '/' },
    { label: 'My NFTs', path: '/collection' },
    { label: 'Create', path: '/create' },
  ]

  return (
    <View style={styles.header}>
      <Text style={styles.logo} onClick={() => navigate('/')}>
        NFT Diploma
      </Text>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.path}
            style={[styles.tab, location.pathname === tab.path && styles.activeTab]}
            onPress={() => navigate(tab.path)}
          >
            <Text style={[styles.tabText, location.pathname === tab.path && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.wallet}>
        <Text style={styles.walletText}>
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Not connected'}
        </Text>
        {wallet && (
          <TouchableOpacity onPress={onLogout}>
            <Text style={styles.logout}>Exit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6c5ce7',
    cursor: 'pointer',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6c5ce7',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  logout: {
    fontSize: 14,
    color: '#e74c3c',
    cursor: 'pointer',
  },
})
