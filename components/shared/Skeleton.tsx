import React from 'react';

/**
 * Utilitas sederhana untuk menggabungkan kelas CSS.
 * @param {...(string | undefined | null | false)[]} classes - Daftar kelas yang akan digabungkan.
 * @returns {string} String kelas yang digabungkan.
 */
function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Komponen Skeleton untuk menampilkan placeholder saat data sedang dimuat.
 * Memberikan efek animasi berkedip (pulse) untuk menunjukkan proses loading.
 * 
 * @param {SkeletonProps} props - Properti komponen Skeleton, mewarisi dari HTMLDivElement.
 * @returns {JSX.Element} Elemen div skeleton yang dirender.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={classNames("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
};