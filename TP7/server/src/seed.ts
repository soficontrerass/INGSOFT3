import { query, close } from './db';

export const seedForecastsData = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando seed de forecasts por ciudad...');

    // Definir datos de prueba por ciudad
    const citiesData = [
      {
        city: 'bogota',
        forecasts: [
          { date: '2026-02-20', temperatureC: 18, summary: 'Nublado' },
          { date: '2026-02-21', temperatureC: 20, summary: 'Parcialmente nublado' },
          { date: '2026-02-22', temperatureC: 19, summary: 'Lluvioso' }
        ]
      },
      {
        city: 'buenos_aires',
        forecasts: [
          { date: '2026-02-20', temperatureC: 28, summary: 'Soleado' },
          { date: '2026-02-21', temperatureC: 26, summary: 'Parcialmente nublado' },
          { date: '2026-02-22', temperatureC: 24, summary: 'Nublado' }
        ]
      },
      {
        city: 'madrid',
        forecasts: [
          { date: '2026-02-20', temperatureC: 12, summary: 'Nublado' },
          { date: '2026-02-21', temperatureC: 14, summary: 'Soleado' },
          { date: '2026-02-22', temperatureC: 13, summary: 'Lluvia ligera' }
        ]
      },
      {
        city: 'mexico',
        forecasts: [
          { date: '2026-02-20', temperatureC: 25, summary: 'Soleado' },
          { date: '2026-02-21', temperatureC: 26, summary: 'Soleado' },
          { date: '2026-02-22', temperatureC: 23, summary: 'Parcialmente nublado' }
        ]
      },
      {
        city: 'santiago',
        forecasts: [
          { date: '2026-02-20', temperatureC: 22, summary: 'Soleado' },
          { date: '2026-02-21', temperatureC: 24, summary: 'Soleado' },
          { date: '2026-02-22', temperatureC: 21, summary: 'Nublado' }
        ]
      }
    ];

    // Limpiar forecasts existentes
    await query('DELETE FROM forecasts');

    // Insertar datos por ciudad
    for (const cityData of citiesData) {
      for (const forecast of cityData.forecasts) {
        await query(
          'INSERT INTO forecasts (city, value, created_at) VALUES ($1, $2, now())',
          [
            cityData.city,
            JSON.stringify({
              date: forecast.date,
              temperatureC: forecast.temperatureC,
              summary: forecast.summary
            })
          ]
        );
      }
    }

    console.log('✅ Seed completado: 15 forecasts insertados (3 por cada ciudad)');
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exitCode = 1;
    throw err;
  } finally {
    await close();
  }
};

if (require.main === module) {
  seedForecastsData().catch(() => {});
}
