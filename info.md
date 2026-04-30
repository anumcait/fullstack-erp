  sql: 'INSERT INTO "tour_application" ("tour_id","tour_date","empid","ename","unit","division","tour_from_date","tour_to_date","purpose","destination","estimated_amount","created_by","created_at","status") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING "tour_id","tour_date","empid","ename","unit","division","designation","tour_from_date","tour_to_date","purpose","destination","estimated_amount","created_by","created_at","status","approval_remark","approved_by","approved_date";',

  parameters: [

    2,

    '2026-04-28 07:04:50.347 +00:00',

    1005,

    'NAMBARI SRINIVASA RAO',

    null,

    'Production',

    '2026-04-29 11:00:00.000 +00:00',

    'Invalid date',

    'Test',

    'Chennai',

    '10000',

    'NAMBARI SRINIVASA RAO',

    '2026-04-28 07:04:50.347 +00:00',

    'Pending'

  ]

}
