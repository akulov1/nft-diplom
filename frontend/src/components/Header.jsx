import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native-web'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { label: 'Маркет', path: '/' },
  { label: 'Мои NFT', path: '/collection' },
  { label: 'Создать', path: '/create' },
]

export default function Header({ wallet, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredTab, setHoveredTab] = useState(null)

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigate('/')} style={styles.logoWrap}>
        <Text style={styles.logoIcon}>◆</Text>
        <Text style={styles.logo}>NFT Marketplace</Text>
      </TouchableOpacity>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.path}
            style={[
              styles.tab,
              location.pathname === tab.path && styles.activeTab,
              hoveredTab === tab.path && !(location.pathname === tab.path) && styles.tabHover,
            ]}
            onPress={() => navigate(tab.path)}
            onMouseEnter={() => setHoveredTab(tab.path)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <Text style={[styles.tabText, location.pathname === tab.path && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.wallet}>
        <View style={styles.dot} />
        <Text style={styles.walletText}>
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Не подключён'}
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
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
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: 22,
    color: '#3b82f6',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    transition: 'all 0.2s ease',
  },
  tabHover: {
    backgroundColor: '#1e293b',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  walletText: {
    fontSize: 13,
    color: '#f1f5f9',
    fontFamily: 'monospace',
  },
  logoutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(239,68,68,0.15)',
    transition: 'all 0.2s ease',
  },
  logoutText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
})
