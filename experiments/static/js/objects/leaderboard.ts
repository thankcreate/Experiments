interface LeaderboardItem {
    name: string,
    score: integer
}

class LeaderboardManager {
    private static instance: LeaderboardManager;
    
    items: LeaderboardItem[];

    static getInstance(): LeaderboardManager {
        if (!LeaderboardManager.instance) {
            LeaderboardManager.instance = new LeaderboardManager();
        }

        return LeaderboardManager.instance;
    }

    private constructor() {
        this.updateInfo();
    }

    updateInfo(): Pany {
        let request = {count: 30};
        let pm = apiPromise('api/leaderboard', request, 'json', 'GET')
            .then(
                val => {
                    this.items = val;
                    console.log(val);    
                },
                err => {                    
                    console.log('Failed to fetch leaderboard info');                    
                });
        return pm;
    }


    reportScore(name: string, score: number) {
        let request = {name: name, score: score};
        let pm = apiPromise('api/leaderboard', JSON.stringify(request), 'json', 'POST')
            .then(
                val => {
                    this.updateInfo();
                    // console.log('Suc to report leaderboard info');                    
                },
                err => {                    
                    // console.log('Failed to report leaderboard score');                    
                });
        return pm;
    }
}