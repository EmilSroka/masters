import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng, LatLngLiteral, LatLngTuple } from 'leaflet';
import { Controller, Control } from "react-hook-form"
import { FormData } from '../hooks/useApartmentDetailsForm';
import { faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';

interface Props {
    control: Control<FormData, any>
}

const MapInput = ({ control }: Props) => {
    const position = [52.23, 21.01] as LatLngTuple;

    return (
        <Controller
            name="latitude"
            control={control}
            defaultValue={1}
            render={({ field: { value: lat, onChange: onLatChange } }) => (
                <Controller
                    name="longitude"
                    control={control}
                    defaultValue={2}
                    render={({ field: { value: lng, onChange: onLngChange } }) => (
                        <MapContainer center={position} zoom={12.5} style={{ height: '40vh', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapMarker latLng={{ lat, lng }} setLatLng={({ lat, lng }) => {
                                onLatChange(lat);
                                onLngChange(lng);
                            }}/>
                        </MapContainer>
                    )}
                />
            )}
        />
    );
};

const MapMarker = ({ latLng, setLatLng }: { latLng: LatLngLiteral, setLatLng: (x: LatLng) => void }) => {
    useMapEvents({
        click(e) {
            setLatLng(e.latlng);
        },
    });
    const fontAwesomeIcon = <FontAwesomeIcon color="rgb(79 70 229)" icon={faLocationPin} size="2x"/>;
    const svgString = ReactDOMServer.renderToStaticMarkup(fontAwesomeIcon);
    const customIcon = new L.DivIcon({
        className: 'custom-icon',
        html: svgString,
        iconSize: [48, 48],
        iconAnchor: [12, 24],
      });
    return <Marker position={latLng} icon={customIcon}  />
}

export default MapInput;