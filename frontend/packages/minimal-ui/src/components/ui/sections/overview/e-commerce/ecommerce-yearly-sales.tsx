import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from '@/components/ui/chart';

import { useState, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from '@/ui/utils/format-number';
import { Chart, useChart, ChartSelect, ChartLegends } from '@/components/ui/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ChartOptions;
  };
};

export function EcommerceYearlySales({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  // Initialize selectedSeries with first series name or default
  const series = chart.series || [];
  const initialSeries = series.length > 0 ? series[0].name : '2023';
  const [selectedSeries, setSelectedSeries] = useState(initialSeries);

  // Update selectedSeries when series changes
  useEffect(() => {
    if (series.length > 0 && !series.find((i) => i.name === selectedSeries)) {
      setSelectedSeries(series[0].name);
    }
  }, [series, selectedSeries]);

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue: string) => {
    setSelectedSeries(newValue);
  }, []);

  // Safe access to series with defaults
  const currentSeries = series.find((i) => i.name === selectedSeries) || series[0];

  // Safe access to first series data
  const firstSeriesData = series[0]?.data || [];
  const labels = firstSeriesData.map((item) => item.name);

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          series.length > 0 ? (
            <ChartSelect
              options={series.map((item) => item.name)}
              value={selectedSeries}
              onChange={handleChangeSeries}
            />
          ) : null
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={labels}
        values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 1,
          py: 2.5,
          pr: 2.5,
          height: 320,
        }}
      />
    </Card>
  );
}
