import { StarRatingWithValue } from '@/components/StarRating';
import { COLORS } from '@/constants/CollorPallet';
import { getReviews, Review } from '@/utils/storage';
import { getRelativeTime } from '@/utils/timeAgo';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 24;

export default function AnalyticsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [citySearch, setCitySearch] = useState('');

  const refresh = async () => {
    setLoading(true);
    const list = await getReviews();
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const uniqueCities = useMemo(() => {
    const cities = Array.from(new Set(reviews.map(r => r.city))).sort();
    return cities;
  }, [reviews]);

  // Filter cities by search input
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return uniqueCities;
    return uniqueCities.filter(city =>
      city.toLowerCase().includes(citySearch.trim().toLowerCase())
    );
  }, [uniqueCities, citySearch]);

  const filteredReviews = useMemo(() => {
    if (selectedCity === 'All') return reviews;
    return reviews.filter(r => r.city === selectedCity);
  }, [reviews, selectedCity]);

  const avgByVehicle = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    for (const r of filteredReviews) {
      const g = groups[r.vehicleType] ?? { sum: 0, count: 0 };
      g.sum += r.rating;
      g.count += 1;
      groups[r.vehicleType] = g;
    }
    const labels = Object.keys(groups);
    const data = labels.map((k) => (groups[k].sum / groups[k].count) || 0);
    return { labels: labels.length ? labels : ['none'], data: data.length ? data : [0] };
  }, [filteredReviews]);

  const perDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of filteredReviews) {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      map[key] = (map[key] ?? 0) + r.rating;
    }
    const labels = Object.keys(map).sort();
    const data = labels.map((k) => map[k]);
    return { labels: labels.length ? labels : ['none'], data: data.length ? data : [0] };
  }, [filteredReviews]);

  // Enhanced chart data for better insights
  const cityPerformance = useMemo(() => {
    const cityMap: Record<string, { sum: number; count: number }> = {};
    for (const r of filteredReviews) {
      if (!cityMap[r.city]) {
        cityMap[r.city] = { sum: 0, count: 0 };
      }
      cityMap[r.city].sum += r.rating;
      cityMap[r.city].count += 1;
    }
    
    const sortedCities = Object.entries(cityMap)
      .map(([city, data]) => ({
        city,
        avgRating: data.sum / data.count,
        reviewCount: data.count
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 6); // Top 6 cities
    
    return {
      labels: sortedCities.map(c => c.city),
      data: sortedCities.map(c => c.avgRating),
      reviewCounts: sortedCities.map(c => c.reviewCount)
    };
  }, [filteredReviews]);

  const hourlyDistribution = useMemo(() => {
    const hourlyMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = 0;
    }
    
    for (const r of filteredReviews) {
      const hour = new Date(r.timestamp).getHours();
      hourlyMap[hour] += 1;
    }
    
    const labels = Object.keys(hourlyMap).map(h => `${h}:00`);
    const data = Object.values(hourlyMap);
    
    return { labels, data };
  }, [filteredReviews]);

  const satisfactionTrend = useMemo(() => {
    const trendMap: Record<string, { sum: number; count: number }> = {};
    for (const r of filteredReviews) {
      const d = new Date(r.timestamp);
      const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
      if (!trendMap[weekKey]) {
        trendMap[weekKey] = { sum: 0, count: 0 };
      }
      trendMap[weekKey].sum += r.rating;
      trendMap[weekKey].count += 1;
    }
    
    const sortedWeeks = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8); // Last 8 weeks
    
    return {
      labels: sortedWeeks.map(([week]) => week),
      data: sortedWeeks.map(([, data]) => data.sum / data.count)
    };
  }, [filteredReviews]);


  const stats = useMemo(() => {
    const totalReviews = filteredReviews.length;
    const avgRating = totalReviews > 0 ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    const vehicleCounts = filteredReviews.reduce((acc, r) => {
      acc[r.vehicleType] = (acc[r.vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const cityCounts = filteredReviews.reduce((acc, r) => {
      acc[r.city] = (acc[r.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalReviews,
      avgRating,
      vehicleCounts,
      cityCounts,
      topVehicle: Object.entries(vehicleCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
      topCity: Object.entries(cityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    };
  }, [filteredReviews]);

  const pieData = useMemo(() => {
    const colors = ['#25D366', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    return Object.entries(stats.vehicleCounts).map(([vehicle, count], index) => ({
      name: vehicle,
      population: count,
      color: colors[index % colors.length],
      legendFontColor: '#374151',
      legendFontSize: 12,
    }));
  }, [stats.vehicleCounts]);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(37, 211, 102, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 1,
    strokeWidth: 2,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };


  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '🚌';
      case 'train': return '🚆';
      case 'tram': return '🚋';
      case 'ferry': return '⛴️';
      default: return '🚗';
    }
  };

  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bus': return '#3B82F6';
      case 'train': return '#8B5CF6';
      case 'tram': return '#F59E0B';
      case 'ferry': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Insights and trends from transit reviews
          </Text>
        </View>

        {/* City Search */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              mode="flat"
              placeholder="Search city..."
              value={citySearch}
              onChangeText={setCitySearch}
              style={styles.searchInput}
              underlineColor="transparent"
              selectionColor={COLORS.primary}
              dense
              theme={{ colors: { text: '#111827', placeholder: '#9ca3af', background: 'transparent' } }}
              placeholderTextColor="#9ca3af"
            />
            {citySearch.length > 0 && (
              <IconButton
                icon="close"
                size={18}
                onPress={() => setCitySearch('')}
                style={styles.clearButton}
                iconColor="#6b7280"
              />
            )}
          </View>
        </View>

        {/* City Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Chip
            selected={selectedCity === 'All'}
            onPress={() => setSelectedCity('All')}
            style={styles.cityChip}
            textStyle={styles.cityChipText}
            mode="outlined"
          >
            <Text>All Cities</Text>
          </Chip>
          {filteredCities.map((c) => (
            <Chip
              key={c}
              selected={selectedCity === c}
              onPress={() => setSelectedCity(c)}
              style={styles.cityChip}
              textStyle={styles.cityChipText}
              mode="outlined"
            >
              <Text>{c}</Text>
            </Chip>
          ))}
        </ScrollView>

        {/* Statistics Summary Cards */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Total Reviews</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.avgRating.toFixed(1)}</Text>
                <Text style={styles.secondaryStatLabel}>Avg Rating</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>{getVehicleIcon(stats.topVehicle)}</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.topVehicle}</Text>
                <Text style={styles.secondaryStatLabel}>Top Vehicle</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIconContainer, styles.secondaryIconContainer]}>
                <Text style={styles.statIcon}>🏙️</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.secondaryStatValue}>{stats.topCity}</Text>
                <Text style={styles.secondaryStatLabel}>Top City</Text>
              </View>
            </Card.Content>
          </Card>
        </View>


        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Performance Analytics</Text>
          
          {/* Average Rating Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Average Rating by Vehicle Type</Text>
                  <Text style={styles.chartSubtitle}>Quality assessment across transit modes</Text>
                </View>
                <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="database">
                  <Text>Live Data</Text>
                </Chip>
              </View>
              <View style={styles.chartContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                ) : avgByVehicle.data.length > 0 ? (
                  <BarChart
                    data={{ labels: avgByVehicle.labels, datasets: [{ data: avgByVehicle.data }] }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix=""
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>No data available</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Daily Traffic Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Daily Review Activity</Text>
                  <Text style={styles.chartSubtitle}>Review volume over time</Text>
                </View>
                <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="trending-up">
                 <Text>Trending</Text>
                </Chip>
              </View>
              <View style={styles.chartContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                ) : perDay.data.length > 0 ? (
                  <LineChart
                    data={{ labels: perDay.labels, datasets: [{ data: perDay.data }] }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                    bezier
                    yAxisLabel=""
                    yAxisSuffix=""
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>No data available</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Vehicle Distribution Pie Chart */}
          {pieData.length > 0 && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>Vehicle Type Distribution</Text>
                    <Text style={styles.chartSubtitle}>Review distribution by transit mode</Text>
                  </View>
                  <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="chart-pie">
                    <Text>Distribution</Text>
                  </Chip>
                </View>
                <View style={styles.chartContainer}>
                  {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                  ) : (
                    <PieChart
                      data={pieData}
                      width={screenWidth - 32}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      style={styles.chart}
                    />
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Enhanced Analytics Charts */}
        <View style={styles.enhancedChartsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Advanced Analytics</Text>
          
          {/* City Performance Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Top Performing Cities</Text>
                  <Text style={styles.chartSubtitle}>Average ratings by city</Text>
                </View>
                <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="city">
                  {cityPerformance.labels.length} Cities
                </Chip>
              </View>
              <View style={styles.chartContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                ) : cityPerformance.data.length > 0 ? (
                  <BarChart
                    data={{ 
                      labels: cityPerformance.labels, 
                      datasets: [{ data: cityPerformance.data }] 
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                    showValuesOnTopOfBars
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <MaterialCommunityIcons name="chart-bar" size={48} color={COLORS.gray} />
                    <Text style={styles.noDataText}>No city data available</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Hourly Distribution Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Peak Review Hours</Text>
                  <Text style={styles.chartSubtitle}>When users are most active</Text>
                </View>
                <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="clock">
                  24h Analysis
                </Chip>
              </View>
              <View style={styles.chartContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                ) : hourlyDistribution.data.length > 0 ? (
                  <LineChart
                    data={{ 
                      labels: hourlyDistribution.labels.slice(0, 12), // Show 12 hours
                      datasets: [{ data: hourlyDistribution.data.slice(0, 12) }] 
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <MaterialCommunityIcons name="clock" size={48} color={COLORS.gray} />
                    <Text style={styles.noDataText}>No hourly data available</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Satisfaction Trend Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Satisfaction Trend</Text>
                  <Text style={styles.chartSubtitle}>Weekly rating progression</Text>
                </View>
                <Chip compact style={styles.dataBadge} textStyle={styles.dataBadgeText} icon="trending-up">
                  {satisfactionTrend.labels.length} Weeks
                </Chip>
              </View>
              <View style={styles.chartContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={styles.chartLoader} />
                ) : satisfactionTrend.data.length > 0 ? (
                  <LineChart
                    data={{ 
                      labels: satisfactionTrend.labels, 
                      datasets: [{ data: satisfactionTrend.data }] 
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <MaterialCommunityIcons name="trending-up" size={48} color={COLORS.gray} />
                    <Text style={styles.noDataText}>No trend data available</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Recent Reviews</Text>
            <Button
              mode="outlined"
              onPress={refresh}
              icon="refresh"
              style={styles.refreshButton}
              labelStyle={styles.refreshButtonText}
              compact
            >
              Refresh
            </Button>
          </View>

          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.slice(0, 5).map((review, index) => (
                <Card key={review.id} style={[styles.reviewCard, index === 0 && styles.firstReviewCard]}>
                  <Card.Content>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewMeta}>
                        <View style={styles.reviewChips}>
                          <Chip 
                            compact 
                            style={[styles.vehicleChip, { backgroundColor: getVehicleColor(review.vehicleType) }]}
                            textStyle={styles.chipText}
                          >
                            <Text>{getVehicleIcon(review.vehicleType)} {review.vehicleType}</Text>
                          </Chip>
                          <Chip 
                            compact 
                            style={styles.locationChip}
                            textStyle={styles.locationChipText}
                            icon="map-marker"
                          >
                            <Text>{review.city}</Text>
                          </Chip>
                        </View>
                        <Text style={styles.reviewTime}>{getRelativeTime(review.timestamp)}</Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <StarRatingWithValue 
                          rating={review.rating} 
                          size={16}
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.reviewText} numberOfLines={3}>
                      {review.reviewText}
                    </Text>
                    
                    <View style={styles.reviewFooter}>
                      <Text style={styles.reviewUser}>by {review.userId}</Text>
                      <View style={styles.reviewActions}>
                        <IconButton
                          icon="thumb-up-outline"
                          size={18}
                          iconColor="#374151"
                          onPress={() => {}}
                        />
                        <IconButton
                          icon="comment-outline"
                          size={18}
                          iconColor="#374151"
                          onPress={() => {}}
                        />
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Text style={styles.emptyStateIcon}>📝</Text>
                <Text variant="titleMedium" style={styles.emptyStateTitle}>No Reviews Yet</Text>
                <Text style={styles.emptyStateText}>
                  Reviews will appear here once users start sharing their transit experiences.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 0, // absolutely no top padding
    backgroundColor: '#f8fafc',
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginTop: 0,      // absolutely no top margin
    marginBottom: 6,   // minimal space below header
    alignItems: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 24,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'column', // stack vertically
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 18,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 0,
    marginHorizontal: 0,
    width: '100%',
    minWidth: undefined,
    flex: undefined,
  },
  primaryCard: {
    backgroundColor: COLORS.primary,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  secondaryIconContainer: {
    backgroundColor: '#f3f4f6',
  },
  secondaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  chartsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dataBadge: {
    backgroundColor: '#d1fae5',
  },
  dataBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    color: '#6b7280',
    fontSize: 14,
  },
  reviewsSection: {
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    marginBottom: 10,
    alignItems: 'center',
  },
  cityChip: {
    height: 30,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    borderColor: COLORS.primary,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  firstReviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#f8fafc',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewChips: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  vehicleChip: {
    height: 28,
  },
  locationChip: {
    backgroundColor: '#f3f4f6',
    height: 28,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reviewTime: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  reviewText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUser: {
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
  reviewActions: {
    flexDirection: 'row',
  },
  emptyStateCard: {
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  searchBarContainer: {
    marginBottom: 8,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
    marginLeft: 0,
  },
  clearButton: {
    marginLeft: 0,
    marginRight: -8,
    backgroundColor: 'transparent',
  },
  chartLoader: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  
  // Enhanced Charts Styles
  enhancedChartsSection: {
    marginBottom: 24,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 8,
  },
  
});