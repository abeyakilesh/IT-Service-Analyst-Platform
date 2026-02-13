const StatCard = ({ title, value, icon, trend, trendUp, color = 'blue' }) => {
    const colors = {
        blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
        green: 'from-green-500/10 to-green-600/5 border-green-500/20',
        yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20',
        red: 'from-red-500/10 to-red-600/5 border-red-500/20',
        purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    };

    const iconColors = {
        blue: 'text-blue-400 bg-blue-500/10',
        green: 'text-green-400 bg-green-500/10',
        yellow: 'text-yellow-400 bg-yellow-500/10',
        red: 'text-red-400 bg-red-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${iconColors[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
