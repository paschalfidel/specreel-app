
export default function RatingStars({ value = 0, max = 10 }) {
  return (
    <div className="text-yellow-400 font-bold">
      {value} / {max}
    </div>
  );
}
