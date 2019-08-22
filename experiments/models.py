from . import db
from datetime import datetime
class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    score = db.Column(db.Integer)

    def __repr__(self):
        return 'User: {}'.format(self.username)    
    
    @property
    def serialize(self):
        return {
            'name'  : self.username,
            'score' : self.score
        }
