'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
} from '@student-erp/ui';
import { Plus, Loader2, Search, Trash2, Edit, Building2, DoorOpen } from 'lucide-react';
import {
  useAdminBuildings,
  useCreateBuilding,
  useDeleteBuilding,
  useAdminBuilding,
} from '@/hooks/api/admin/useBuildings';
import {
  useAdminRooms,
  useCreateRoom,
  useDeleteRoom,
  useUpdateRoom,
} from '@/hooks/api/admin/useRooms';

const ROOM_TYPES = ['CLASSROOM', 'LAB', 'LECTURE_HALL', 'OFFICE', 'CONFERENCE', 'OTHER'] as const;

const roomTypeBadge = (type: string) => {
  const map: Record<string, 'default' | 'secondary' | 'outline'> = {
    CLASSROOM: 'default',
    LAB: 'secondary',
    LECTURE_HALL: 'outline',
    OFFICE: 'secondary',
    CONFERENCE: 'outline',
    OTHER: 'secondary',
  };
  return map[type] || 'secondary';
};

export default function RoomsPage() {
  const [search, setSearch] = useState('');
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');

  // Buildings
  const { data: buildingsData, isLoading: buildingsLoading } = useAdminBuildings(1, 100, '');
  const createBuilding = useCreateBuilding();
  const deleteBuilding = useDeleteBuilding();

  // Rooms
  const { data: roomsData, isLoading: roomsLoading } = useAdminRooms(
    1,
    200,
    search,
    selectedBuildingId,
  );
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const buildings = buildingsData?.data || [];
  const rooms = roomsData?.data || [];

  // Building form state
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    code: '',
    address: '',
    floors: '1',
  });
  const resetBuildingForm = () => setBuildingForm({ name: '', code: '', address: '', floors: '1' });

  // Room form state
  const [roomForm, setRoomForm] = useState({
    buildingId: '',
    name: '',
    number: '',
    floor: '0',
    capacity: '',
    roomType: 'CLASSROOM',
  });
  const resetRoomForm = () =>
    setRoomForm({
      buildingId: '',
      name: '',
      number: '',
      floor: '0',
      capacity: '',
      roomType: 'CLASSROOM',
    });

  const handleCreateBuilding = async () => {
    if (!buildingForm.name || !buildingForm.code) return;
    await createBuilding.mutateAsync({
      name: buildingForm.name,
      code: buildingForm.code,
      address: buildingForm.address || undefined,
      floors: buildingForm.floors ? parseInt(buildingForm.floors) : undefined,
    });
    resetBuildingForm();
    setShowBuildingDialog(false);
  };

  const handleCreateRoom = async () => {
    if (!roomForm.name || !roomForm.number || !roomForm.buildingId) return;
    if (editingRoom) {
      await updateRoom.mutateAsync({
        id: editingRoom.id,
        data: {
          buildingId: roomForm.buildingId,
          name: roomForm.name,
          number: roomForm.number,
          floor: roomForm.floor ? parseInt(roomForm.floor) : undefined,
          capacity: roomForm.capacity ? parseInt(roomForm.capacity) : undefined,
          roomType: roomForm.roomType,
        },
      });
    } else {
      await createRoom.mutateAsync({
        buildingId: roomForm.buildingId,
        name: roomForm.name,
        number: roomForm.number,
        floor: roomForm.floor ? parseInt(roomForm.floor) : undefined,
        capacity: roomForm.capacity ? parseInt(roomForm.capacity) : undefined,
        roomType: roomForm.roomType,
      });
    }
    resetRoomForm();
    setEditingRoom(null);
    setShowRoomDialog(false);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setRoomForm({
      buildingId: room.buildingId,
      name: room.name,
      number: room.number,
      floor: String(room.floor ?? 0),
      capacity: room.capacity ? String(room.capacity) : '',
      roomType: room.roomType,
    });
    setShowRoomDialog(true);
  };

  const openNewRoomDialog = () => {
    resetRoomForm();
    setEditingRoom(null);
    if (selectedBuildingId) {
      setRoomForm((prev) => ({ ...prev, buildingId: selectedBuildingId }));
    }
    setShowRoomDialog(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage buildings and rooms in your institution.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBuildingDialog(true)}>
            <Building2 className="mr-2 h-4 w-4" /> Add Building
          </Button>
          <Button onClick={openNewRoomDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Room
          </Button>
        </div>
      </div>

      {/* Buildings overview */}
      <Card>
        <CardHeader>
          <CardTitle>Buildings</CardTitle>
          <CardDescription>All buildings in your institution</CardDescription>
        </CardHeader>
        <CardContent>
          {buildingsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : buildings.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No buildings found. Add a building to get started.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b: any) => (
                <div
                  key={b.id}
                  className="bg-muted/50 flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {b.code}
                      {b._count?.rooms != null && ` · ${b._count.rooms} rooms`}
                      {b.floors && ` · ${b.floors} floors`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Delete building "${b.name}"? This will fail if it has rooms.`)) {
                        deleteBuilding.mutate(b.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rooms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>All rooms across buildings</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search rooms..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {roomsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No rooms found. Add a room to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building</TableHead>
                  <TableHead>Room #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room: any) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.building?.name || '—'}</TableCell>
                    <TableCell>{room.number}</TableCell>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.floor ?? '—'}</TableCell>
                    <TableCell>{room.capacity ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={roomTypeBadge(room.roomType)}>
                        {room.roomType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Delete room "${room.name}"?`)) {
                            deleteRoom.mutate(room.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Building Dialog */}
      <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Building</DialogTitle>
            <DialogDescription>Create a new building in your institution.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Building Name</Label>
              <Input
                value={buildingForm.name}
                onChange={(e) => setBuildingForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Main Block"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={buildingForm.code}
                onChange={(e) => setBuildingForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. MB01"
              />
            </div>
            <div>
              <Label>Address (optional)</Label>
              <Input
                value={buildingForm.address}
                onChange={(e) => setBuildingForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 123 University Rd"
              />
            </div>
            <div>
              <Label>Floors</Label>
              <Input
                type="number"
                min="1"
                value={buildingForm.floors}
                onChange={(e) => setBuildingForm((f) => ({ ...f, floors: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuildingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBuilding} disabled={createBuilding.isPending}>
              {createBuilding.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Room Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room details.' : 'Add a new room to a building.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Building</Label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={roomForm.buildingId}
                onChange={(e) => setRoomForm((f) => ({ ...f, buildingId: e.target.value }))}
              >
                <option value="">Select building...</option>
                {buildings.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Room Name</Label>
              <Input
                value={roomForm.name}
                onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Room 101"
              />
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={roomForm.number}
                onChange={(e) => setRoomForm((f) => ({ ...f, number: e.target.value }))}
                placeholder="e.g. 101"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Floor</Label>
                <Input
                  type="number"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm((f) => ({ ...f, floor: e.target.value }))}
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min="0"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="e.g. 40"
                />
              </div>
            </div>
            <div>
              <Label>Room Type</Label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={roomForm.roomType}
                onChange={(e) => setRoomForm((f) => ({ ...f, roomType: e.target.value }))}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={createRoom.isPending || updateRoom.isPending}
            >
              {createRoom.isPending || updateRoom.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingRoom ? (
                'Save'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
