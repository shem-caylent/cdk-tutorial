export function handler(event) {
  const height = process.env.HEIGHT;
  const width = process.env.WIDTH;
  console.log(`Resized to height of ${height} and width of ${width}`)
}