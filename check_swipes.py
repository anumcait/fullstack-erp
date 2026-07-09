import sys, json
data = json.load(sys.stdin)
for r in data:
    if r.get('in_time') or r.get('out_time'):
        print(f"emp={r['empid']} date={r['att_date']} in={r.get('in_time')} out={r.get('out_time')} ot={r.get('ot_hrs')} status={r.get('status')}")
        break
else:
    print('No records with in/out times found')
