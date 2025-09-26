import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  PROFESSIONAL_THEME, 
  PROFESSIONAL_TOOLTIP_STYLE,
  PROFESSIONAL_LEGEND_STYLE,
  PROFESSIONAL_AXIS_STYLE
} from '../styles/chartTheme';

interface AdvancedChartProps {
  data: any[];
  title: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

// Professional Composed Chart (Bar + Line)
export const ProfessionalComposedChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={PROFESSIONAL_THEME.spacing.margin}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PROFESSIONAL_THEME.colors.primary} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={PROFESSIONAL_THEME.colors.primary} stopOpacity={0.4}/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PROFESSIONAL_THEME.colors.success} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={PROFESSIONAL_THEME.colors.success} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={PROFESSIONAL_THEME.grid.stroke} />
          <XAxis 
            dataKey="name" 
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          <YAxis 
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          {showTooltip && (
            <Tooltip 
              contentStyle={PROFESSIONAL_TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
            />
          )}
          {showLegend && (
            <Legend 
              {...PROFESSIONAL_LEGEND_STYLE}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
          <Bar 
            dataKey="volume" 
            fill="url(#barGradient)" 
            radius={[4, 4, 0, 0]}
            name="Transaction Volume"
          />
          <Line 
            type="monotone" 
            dataKey="trend" 
            stroke={PROFESSIONAL_THEME.colors.success}
            strokeWidth={3}
            dot={{ fill: PROFESSIONAL_THEME.colors.success, strokeWidth: 2, r: 4 }}
            name="Growth Trend"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional Radar Chart
export const ProfessionalRadarChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} margin={PROFESSIONAL_THEME.spacing.margin}>
          <PolarGrid stroke={PROFESSIONAL_THEME.grid.stroke} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          <PolarRadiusAxis 
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
            domain={[0, 100]}
          />
          {showTooltip && (
            <Tooltip contentStyle={PROFESSIONAL_TOOLTIP_STYLE} />
          )}
          {showLegend && (
            <Legend {...PROFESSIONAL_LEGEND_STYLE} />
          )}
          <Radar 
            name="Performance" 
            dataKey="A" 
            stroke={PROFESSIONAL_THEME.colors.primary} 
            fill={PROFESSIONAL_THEME.colors.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar 
            name="Target" 
            dataKey="B" 
            stroke={PROFESSIONAL_THEME.colors.success} 
            fill={PROFESSIONAL_THEME.colors.success}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional Scatter Plot
export const ProfessionalScatterChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart data={data} margin={PROFESSIONAL_THEME.spacing.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={PROFESSIONAL_THEME.grid.stroke} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Transaction Amount"
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Customer Age"
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          {showTooltip && (
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={PROFESSIONAL_TOOLTIP_STYLE}
            />
          )}
          {showLegend && (
            <Legend {...PROFESSIONAL_LEGEND_STYLE} />
          )}
          <Scatter 
            name="Customers" 
            dataKey="z" 
            fill={PROFESSIONAL_THEME.colors.primary}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional Treemap
export const ProfessionalTreemap: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = false,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap data={data}>
          {showTooltip && (
            <Tooltip contentStyle={PROFESSIONAL_TOOLTIP_STYLE} />
          )}
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional Funnel Chart
export const ProfessionalFunnelChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <FunnelChart data={data}>
          {showTooltip && (
            <Tooltip contentStyle={PROFESSIONAL_TOOLTIP_STYLE} />
          )}
          {showLegend && (
            <Legend {...PROFESSIONAL_LEGEND_STYLE} />
          )}
          <Funnel 
            dataKey="value" 
            nameKey="name"
            fill={PROFESSIONAL_THEME.colors.primary}
            stroke={PROFESSIONAL_THEME.colors.primary}
            strokeWidth={2}
          />
          <LabelList 
            dataKey="name" 
            position="center" 
            fill="white"
            fontSize={12}
            fontWeight={500}
          />
        </FunnelChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional Multi-Line Chart with Area
export const ProfessionalAreaChart: React.FC<AdvancedChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      <Heading size="md" mb={4} color="gray.700">{title}</Heading>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={PROFESSIONAL_THEME.spacing.margin}>
          <defs>
            <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PROFESSIONAL_THEME.colors.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={PROFESSIONAL_THEME.colors.primary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PROFESSIONAL_THEME.colors.success} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={PROFESSIONAL_THEME.colors.success} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={PROFESSIONAL_THEME.grid.stroke} />
          <XAxis 
            dataKey="name" 
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          <YAxis 
            {...PROFESSIONAL_AXIS_STYLE}
            tick={{ fontSize: PROFESSIONAL_AXIS_STYLE.fontSize }}
          />
          {showTooltip && (
            <Tooltip 
              contentStyle={PROFESSIONAL_TOOLTIP_STYLE}
              cursor={{ stroke: PROFESSIONAL_THEME.colors.primary, strokeWidth: 1 }}
            />
          )}
          {showLegend && (
            <Legend 
              {...PROFESSIONAL_LEGEND_STYLE}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
          <Area 
            type="monotone" 
            dataKey="deposits" 
            stackId="1" 
            stroke={PROFESSIONAL_THEME.colors.primary} 
            fill="url(#areaGradient1)"
            strokeWidth={2}
            name="Deposits"
          />
          <Area 
            type="monotone" 
            dataKey="withdrawals" 
            stackId="2" 
            stroke={PROFESSIONAL_THEME.colors.success} 
            fill="url(#areaGradient2)"
            strokeWidth={2}
            name="Withdrawals"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Professional KPI Cards
export const ProfessionalKPICard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}> = ({ title, value, change, changeLabel, icon, color = 'blue' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      p={6} 
      bg={bgColor} 
      borderRadius="lg" 
      shadow="md" 
      border="1px solid" 
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        right={0}
        width="100px"
        height="100px"
        bg={`${color}.50`}
        borderRadius="full"
        transform="translate(30px, -30px)"
        opacity={0.1}
      />
      
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" width="100%">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          {icon && (
            <Box color={`${color}.500`} fontSize="lg">
              {icon}
            </Box>
          )}
        </HStack>
        
        <Stat>
          <StatNumber fontSize="2xl" color="gray.800" fontWeight="bold">
            {value}
          </StatNumber>
          {change !== undefined && (
            <StatHelpText>
              <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}% {changeLabel}
            </StatHelpText>
          )}
        </Stat>
      </VStack>
    </Box>
  );
};

// Professional Metric Grid
export const ProfessionalMetricGrid: React.FC<{
  metrics: Array<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    color?: string;
  }>;
}> = ({ metrics }) => {
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
      {metrics.map((metric, index) => (
        <GridItem key={index}>
          <ProfessionalKPICard {...metric} />
        </GridItem>
      ))}
    </Grid>
  );
};
