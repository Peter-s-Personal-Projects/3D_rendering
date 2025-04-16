import xml.etree.ElementTree as ET
from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

def parse_osm_file(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except ET.ParseError as e:
        return {"error": f"Failed to parse XML: {str(e)}"}, 400

    nodes = {}
    for node in root.findall('node'):
        node_id = node.get('id')
        lat = float(node.get('lat'))
        lon = float(node.get('lon'))
        tags = {tag.get('k'): tag.get('v') for tag in node.findall('tag')}
        nodes[node_id] = {'lat': lat, 'lon': lon, 'tags': tags}

    buildings = []
    for way in root.findall('way'):
        way_id = way.get('id')
        node_refs = [nd.get('ref') for nd in way.findall('nd')]
        tags = {tag.get('k'): tag.get('v') for tag in way.findall('tag')}

        if 'building' in tags:
            coords = []
            for ref in node_refs:
                if ref in nodes:
                    coords.append([nodes[ref]['lon'], nodes[ref]['lat']])
            if len(coords) < 3:
                continue
            if coords[0] != coords[-1]:
                coords.append(coords[0])

            height = tags.get('height', None)
            if not height:
                levels = tags.get('building:levels', None)
                height = str(float(levels) * 3) if levels and levels.isdigit() else '10'

            address = f"{tags.get('addr:housenumber', '')} {tags.get('addr:street', '')}".strip()

            building = {
                'id': way_id,
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coords]
                },
                'properties': {
                    'building': tags.get('building', 'yes'),
                    'height': height,
                    'address': address,
                    'tags': tags
                }
            }
            buildings.append(building)

    return {
        'buildings': {'type': 'FeatureCollection', 'features': buildings}
    }

@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    data = parse_osm_file('../map.osm')
    if 'error' in data:
        return jsonify(data), data.get('error_code', 500)
    return jsonify(data['buildings'])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # default fallback for local dev
    app.run(host='0.0.0.0', port=port)