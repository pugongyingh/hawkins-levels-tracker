import { client, q, verifyToken } from '../client';

module.exports = async (req, res) => {
    try {
        const {
            user: { userId },
        } = verifyToken(req.body?.token);

        if (req.body.subscription) {
            const dbs: any = await client.query(
                q.Create(q.Ref(q.Collection('user-subscriptions'), q.NewId()), {
                    data: { subscription: req.body.subscription, userId },
                })
            );
            // ok
            res.status(200).json(dbs?.data);
        } else {
            throw Error('No subscription found');
        }
    } catch (e) {
        // something went wrong
        res.status(500).json({ error: e.message });
    }
};
