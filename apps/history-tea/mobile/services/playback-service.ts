import TrackPlayer, { Event } from "react-native-track-player";
import { usePlayerStore } from "@/stores/player";

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
    usePlayerStore.getState().setPlaying(true);
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
    usePlayerStore.getState().setPlaying(false);
    usePlayerStore.getState().syncProgress();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    usePlayerStore.getState().playNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    usePlayerStore.getState().playPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
    usePlayerStore.getState().updatePosition(
      event.position,
      usePlayerStore.getState().duration
    );
  });

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
    usePlayerStore.getState().updatePosition(event.position, event.duration);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    const isBuffering =
      event.state === "buffering" || event.state === "loading";
    usePlayerStore.getState().setBuffering(isBuffering);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    usePlayerStore.getState().setPlaying(false);
    usePlayerStore.getState().syncProgress();
  });
}
