from experiments import db
from experiments.models import Review
l = Review(username='trontron4', comment='good')
db.session.add(l)
db.session.commit()

ls = Review.query.all()
print(ls)