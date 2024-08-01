'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useNaverMapScript } from '@/hooks/Map/useNaverMapScript';

interface Place {
  title: string;
  category: string;
  description: string;
}

interface PlaceData {
  lat: number[];
  long: number[];
  places: Place[];
}

interface PostAndPlacesData {
  places: PlaceData[];
}

const Map = () => {
  const clientId = process.env.NEXT_PUBLIC_NCP_CLIENT_ID!;
  const isScriptLoaded = useNaverMapScript(clientId);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id; // URL에서 id를 가져옴
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchPostAndPlaces = async (postId: string): Promise<PostAndPlacesData> => {
    try {
      const response = await axios.get(`/api/detail/map/${postId}`);
      const data = response.data;

      const parsedPlaces = data.places.map((item: any) => {
        return {
          lat: item.lat,
          long: item.long,
          places: item.places
        };
      });

      return { places: parsedPlaces };
    } catch (error) {
      console.error('Error fetching post and places:', error);
      throw error;
    }
  };

  // Supabase에서 게시물 및 장소 데이터를 가져오기 위한 React Query
  const { data, error, isLoading } = useQuery<PostAndPlacesData>({
    queryKey: ['postAndPlaces', postId],
    queryFn: () => fetchPostAndPlaces(postId)
  });

  useEffect(() => {
    if (!isScriptLoaded || isLoading || !data || data.places.length === 0) return;

    // 지도 초기화 함수
    const initializeMap = () => {
      const map = new window.naver.maps.Map('map', {
        center: new window.naver.maps.LatLng(data.places[0].lat[0], data.places[0].long[0]),
        zoom: 10
      });
      setMapInstance(map);
    };

    initializeMap();
  }, [isScriptLoaded, isLoading, data]);

  useEffect(() => {
    if (!mapInstance || !data) return;

    // 이전 마커 삭제
    if (mapInstance.markers) {
      mapInstance.markers.forEach((marker: any) => marker.setMap(null));
    } else {
      mapInstance.markers = [];
    }

    const newMarkers = data.places[selectedDay].lat
      .map((lat: number, index: number) => {
        if (index < data.places[selectedDay].long.length) {
          const markerContent = `
          <div class="text-white bg-primary-300 border-2 border-white px-2 rounded-full">${index + 1}</div>
        `;
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, data.places[selectedDay].long[index]),
            map: mapInstance,
            title: data.places[selectedDay].places[index].title,
            icon: {
              content: markerContent,
              anchor: new window.naver.maps.Point(12, 12)
            }
          });
          return marker;
        }
      })
      .filter((marker) => marker !== undefined);

    mapInstance.markers = newMarkers;
  }, [mapInstance, data, selectedDay]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading map data</div>;

  return (
    <div>
      <h1>Where you’ll tour</h1>
      <div>
        <button
          onClick={() => setSelectedDay(0)}
          className={`${selectedDay === 0 ? 'bg-primary-300 text-white' : 'bg-grayscale-50'}`}
        >
          Day 1
        </button>
        <button
          onClick={() => setSelectedDay(1)}
          className={`${selectedDay === 1 ? 'bg-primary-300 text-white' : 'bg-grayscale-50'}`}
        >
          Day 2
        </button>
        <button
          onClick={() => setSelectedDay(2)}
          className={` ${selectedDay === 2 ? 'bg-primary-300 text-white' : 'bg-grayscale-50'}`}
        >
          Day 3
        </button>
      </div>
      <div id="map" style={{ width: '100%', height: '300px', marginTop: '20px' }}></div>
      <hr className="bg-grayscale-100 h-[1px] w-full" />
      <div className="place-list">
        {data?.places[selectedDay].places.map((place, index) => (
          <div key={index} className="place-item flex items-start">
            <div className="number-circle bg-primary-300 flex h-8 w-8 items-center justify-center rounded-full text-white">
              {index + 1}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{place.title.replace(/<\/?[^>]+(>|$)/g, '')}</h2>
              <p className="text-gray-500">{place.category}</p>
              <p>{place.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Map;
