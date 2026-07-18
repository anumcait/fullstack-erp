#!/bin/bash
cd /opt/erp-app
python3 << 'PYEOF'
with open("docker-compose.demo.yaml") as f:
    lines = f.readlines()
new_lines = []
for line in lines:
    if "ECR_REGISTRY" in line:
        # Extract just the image name part
        import re
        m = re.search(r'erp-[\w]+:\S+', line)
        if m:
            new_lines.append(f"    image: {m.group()}\n")
            print(f"Fixed: {line.strip()} -> {m.group()}")
        else:
            print(f"Skipped: {line.strip()}")
    else:
        new_lines.append(line)
with open("docker-compose.demo.yaml", "w") as f:
    f.writelines(new_lines)
PYEOF
echo "--- Fixed compose file ---"
grep 'image:' docker-compose.demo.yaml
echo "--- Restarting ---"
docker compose -f docker-compose.demo.yaml down --remove-orphans
docker compose -f docker-compose.demo.yaml up -d --remove-orphans
sleep 5
docker ps
