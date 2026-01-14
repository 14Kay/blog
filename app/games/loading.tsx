export default function Loading() {
    return (
        <div className="space-y-12 pb-12 animate-pulse">
            {/* Hero Skeleton */}
            <section className="relative w-full h-[400px] sm:h-[500px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2 text-center">
                        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
                        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 -mt-12 relative z-20">
                {/* Most Played Skeleton */}
                <section className="pt-12">
                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-[300px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
                        <div className="grid grid-rows-2 gap-6">
                            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-full"></div>
                            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-full"></div>
                        </div>
                    </div>
                </section>

                {/* Recent Games Skeleton */}
                <section>
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[460/215] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
