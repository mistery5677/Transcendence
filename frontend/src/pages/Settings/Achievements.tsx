import React, { useState, useEffect } from "react";
import { IconTrophy } from "@tabler/icons-react"; 
import { getMyAchievements } from "../../api/usersApi"; 

const BASE_ACHIEVEMENTS = [
    { id: 'FIRST_WIN', title: 'First Blood!', description: 'Win your first match in online mode.', icon: '🥇', unlocked: false },
    { id: 'FIRST_FRIEND', title: 'Friends Forever', description: 'Add a friend to your list', icon: '👋', unlocked: false },
    { id: 'GRAND_MASTER', title: 'Grand Master', description: 'Achieve 1800 elo for the first time', icon: '⚔️', unlocked: false }
];

export function ProfileAchievements() {
    const [myAchievements, setMyAchievements] = useState(BASE_ACHIEVEMENTS);

    useEffect(() => {
        async function fetchAchievements() {
            const unlockedIds = await getMyAchievements();

            const updatedList = BASE_ACHIEVEMENTS.map(ach => ({
                ...ach,
                unlocked: unlockedIds.includes(ach.id)
            }));
            
            setMyAchievements(updatedList);
        }

        fetchAchievements();
    }, []);

    return (
        <div>
            <div className="mb-1 flex items-center gap-3">
                <IconTrophy size={32} stroke={2} className="text-emerald-400" />
                <h2 className="text-2xl font-bold text-stone-100">Your achievements</h2>
            </div>
            
            <p className="mb-6 text-sm text-stone-400">
                Collect achievements by completing some objectives
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {myAchievements.map((achievement) => (
                    <div 
                        key={achievement.id} 
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 ${
                            achievement.unlocked 
                            ? "border-emerald-500/50 bg-stone-800/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "border-stone-800 bg-stone-900/40 opacity-60 grayscale"
                        }`}
                    >
                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl ${
                            achievement.unlocked ? "bg-emerald-500/10" : "bg-stone-800"
                        }`}>
                            {achievement.unlocked ? achievement.icon : "🔒"}
                        </div>

                        <div>
                            <h3 className={`text-lg font-bold ${
                                achievement.unlocked ? "text-emerald-400" : "text-stone-400"
                            }`}>
                                {achievement.title}
                            </h3>
                            <p className="mt-1 text-sm leading-snug text-stone-400">
                                {achievement.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}