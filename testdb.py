from experiments import db, create_app
from experiments.models import Leaderboard

app = create_app()
app.app_context().push()

l = Leaderboard(username='trontron4', score=5000)
db.session.add(l)
db.session.commit()

ls = Leaderboard.query.all()
print(ls)