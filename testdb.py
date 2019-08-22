from experiments import db
from experiments.models import Leaderboard
l = Leaderboard(username='trontron4', score=5000)
db.session.add(l)
db.session.commit()

ls = Leaderboard.query.all()
print(ls)